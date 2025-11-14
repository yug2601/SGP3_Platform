"use client"

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import socketManager from '@/lib/socket'
import { api } from '@/lib/api'
import type { Notification } from '@/lib/types'

export function useNotifications() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingArchived, setLoadingArchived] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await api<Notification[]>('/api/notifications')
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.isRead).length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load archived notifications
  const loadArchivedNotifications = useCallback(async () => {
    if (!user) return
    
    try {
      setLoadingArchived(true)
      const data = await api<Notification[]>('/api/notifications?archived=true')
      setArchivedNotifications(data)
    } catch (error) {
      console.error('Failed to load archived notifications:', error)
    } finally {
      setLoadingArchived(false)
    }
  }, [user])

  // Handle incoming real-time notifications
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1)
    }
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))

      // Update on server
      await api(`/api/notifications/${notificationId}`, { method: 'PATCH' })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      // Revert optimistic update on error
      loadNotifications()
    }
  }, [loadNotifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)

      // Update on server
      await api('/api/notifications', { method: 'PATCH' })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      // Revert optimistic update on error
      loadNotifications()
    }
  }, [loadNotifications])

  // Archive notification
  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId)
      if (!notification) return

      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setArchivedNotifications(prev => [{ ...notification, archived: true }, ...prev])
      
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

      // Archive on server
      await api(`/api/notifications/${notificationId}/archive`, { method: 'PATCH' })
    } catch (error) {
      console.error('Failed to archive notification:', error)
      // Revert optimistic update on error
      loadNotifications()
      loadArchivedNotifications()
    }
  }, [notifications, loadNotifications, loadArchivedNotifications])

  // Unarchive notification
  const unarchiveNotification = useCallback(async (notificationId: string) => {
    try {
      const notification = archivedNotifications.find(n => n.id === notificationId)
      if (!notification) return

      // Optimistic update
      setArchivedNotifications(prev => prev.filter(n => n.id !== notificationId))
      setNotifications(prev => [{ ...notification, archived: false }, ...prev])

      // Unarchive on server
      await api(`/api/notifications/${notificationId}/archive`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to unarchive notification:', error)
      // Revert optimistic update on error
      loadNotifications()
      loadArchivedNotifications()
    }
  }, [archivedNotifications, loadNotifications, loadArchivedNotifications])

  // Delete notification permanently
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId) || 
                          archivedNotifications.find(n => n.id === notificationId)
      
      // Optimistic update for both lists
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setArchivedNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

      // Delete on server permanently
      await api(`/api/notifications/${notificationId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      // Revert optimistic update on error
      loadNotifications()
      loadArchivedNotifications()
    }
  }, [notifications, archivedNotifications, loadNotifications, loadArchivedNotifications])

  // Initialize socket connection and load notifications
  useEffect(() => {
    if (!user?.id) return

    // Load initial notifications
    loadNotifications()

    // Connect to Socket.IO
    socketManager.connect()

    // Listen for new notifications
    socketManager.onNotification(handleNewNotification)

    return () => {
      // Cleanup socket listeners
      socketManager.offNotification(handleNewNotification)
    }
  }, [user?.id, loadNotifications, handleNewNotification])

  return {
    notifications,
    archivedNotifications,
    loading,
    loadingArchived,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    unarchiveNotification,
    deleteNotification,
    loadArchivedNotifications,
    refetch: loadNotifications,
  }
}