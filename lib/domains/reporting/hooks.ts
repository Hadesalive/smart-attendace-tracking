"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  ReportingState, 
  AnonymousReport,
  SocialMediaMention,
  Rumor,
  ReportResponse,
  CommunityPost,
  ReputationAnalytics
} from './types'

export function useReporting() {
  const [state, setState] = useState<ReportingState>({
    anonymousReports: [],
    socialMediaMentions: [],
    rumors: [],
    reportResponses: [],
    communityPosts: [],
    reputationAnalytics: [],
    loading: false,
    error: null
  })

  // ============================================================================
  // ANONYMOUS REPORTS
  // ============================================================================

  const fetchAnonymousReports = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('anonymous_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setState(prev => ({ ...prev, anonymousReports: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching anonymous reports:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch anonymous reports', 
        loading: false 
      }))
    }
  }, [])

  const submitAnonymousReport = useCallback(async (report: Omit<AnonymousReport, 'id' | 'reference_code' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('anonymous_reports')
        .insert({
          ...report,
          status: 'submitted'
        })
        .select()
        .single()

      if (error) throw error
      
      setState(prev => ({ 
        ...prev, 
        anonymousReports: [data, ...prev.anonymousReports],
        loading: false 
      }))
      
      return data
    } catch (error) {
      console.error('Error submitting anonymous report:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to submit report', 
        loading: false 
      }))
      throw error
    }
  }, [])

  const updateReportStatus = useCallback(async (reportId: string, status: AnonymousReport['status'], updates?: Partial<AnonymousReport>) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('anonymous_reports')
        .update({ 
          status,
          ...updates,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', reportId)
        .select()
        .single()

      if (error) throw error
      
      setState(prev => ({
        ...prev,
        anonymousReports: prev.anonymousReports.map(r => r.id === reportId ? data : r),
        loading: false
      }))
      
      return data
    } catch (error) {
      console.error('Error updating report status:', error)
      setState(prev => ({ ...prev, error: 'Failed to update report', loading: false }))
      throw error
    }
  }, [])

  const getReportByReferenceCode = useCallback(async (referenceCode: string) => {
    try {
      const { data, error } = await supabase
        .from('anonymous_reports')
        .select('*')
        .eq('reference_code', referenceCode)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching report by reference code:', error)
      throw error
    }
  }, [])

  // ============================================================================
  // SOCIAL MEDIA MENTIONS
  // ============================================================================

  const fetchSocialMediaMentions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('social_media_mentions')
        .select('*')
        .order('mention_date', { ascending: false })

      if (error) throw error
      setState(prev => ({ ...prev, socialMediaMentions: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching social media mentions:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch social media mentions', 
        loading: false 
      }))
    }
  }, [])

  const createSocialMediaMention = useCallback(async (mention: Omit<SocialMediaMention, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('social_media_mentions')
        .insert(mention)
        .select()
        .single()

      if (error) throw error
      
      setState(prev => ({ 
        ...prev, 
        socialMediaMentions: [data, ...prev.socialMediaMentions],
        loading: false 
      }))
      
      return data
    } catch (error) {
      console.error('Error creating social media mention:', error)
      setState(prev => ({ ...prev, error: 'Failed to create mention', loading: false }))
      throw error
    }
  }, [])

  const updateSocialMediaMention = useCallback(async (mentionId: string, updates: Partial<SocialMediaMention>) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('social_media_mentions')
        .update(updates)
        .eq('id', mentionId)
        .select()
        .single()

      if (error) throw error
      
      setState(prev => ({
        ...prev,
        socialMediaMentions: prev.socialMediaMentions.map(m => m.id === mentionId ? data : m),
        loading: false
      }))
      
      return data
    } catch (error) {
      console.error('Error updating social media mention:', error)
      setState(prev => ({ ...prev, error: 'Failed to update mention', loading: false }))
      throw error
    }
  }, [])

  // ============================================================================
  // RUMORS
  // ============================================================================

  const fetchRumors = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('rumors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setState(prev => ({ ...prev, rumors: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching rumors:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch rumors', 
        loading: false 
      }))
    }
  }, [])

  const createRumor = useCallback(async (rumor: Omit<Rumor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('rumors')
        .insert(rumor)
        .select()
        .single()

      if (error) throw error
      
      setState(prev => ({ 
        ...prev, 
        rumors: [data, ...prev.rumors],
        loading: false 
      }))
      
      return data
    } catch (error) {
      console.error('Error creating rumor:', error)
      setState(prev => ({ ...prev, error: 'Failed to create rumor', loading: false }))
      throw error
    }
  }, [])

  const updateRumor = useCallback(async (rumorId: string, updates: Partial<Rumor>) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('rumors')
        .update({
          ...updates,
          resolved_at: updates.status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', rumorId)
        .select()
        .single()

      if (error) throw error
      
      setState(prev => ({
        ...prev,
        rumors: prev.rumors.map(r => r.id === rumorId ? data : r),
        loading: false
      }))
      
      return data
    } catch (error) {
      console.error('Error updating rumor:', error)
      setState(prev => ({ ...prev, error: 'Failed to update rumor', loading: false }))
      throw error
    }
  }, [])

  // ============================================================================
  // REPORT RESPONSES
  // ============================================================================

  const fetchReportResponses = useCallback(async (reportId?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      let query = supabase
        .from('report_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (reportId) {
        query = query.eq('report_id', reportId)
      }

      const { data, error } = await query

      if (error) throw error
      setState(prev => ({ ...prev, reportResponses: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching report responses:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch report responses', 
        loading: false 
      }))
    }
  }, [])

  const createReportResponse = useCallback(async (response: Omit<ReportResponse, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('report_responses')
        .insert(response)
        .select()
        .single()

      if (error) throw error
      
      setState(prev => ({ 
        ...prev, 
        reportResponses: [data, ...prev.reportResponses],
        loading: false 
      }))
      
      return data
    } catch (error) {
      console.error('Error creating report response:', error)
      setState(prev => ({ ...prev, error: 'Failed to create response', loading: false }))
      throw error
    }
  }, [])

  // ============================================================================
  // COMMUNITY POSTS
  // ============================================================================

  const fetchCommunityPosts = useCallback(async (postType?: CommunityPost['post_type']) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      let query = supabase
        .from('community_posts')
        .select('*')
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (postType) {
        query = query.eq('post_type', postType)
      }

      const { data, error } = await query

      if (error) throw error
      setState(prev => ({ ...prev, communityPosts: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching community posts:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch community posts', 
        loading: false 
      }))
    }
  }, [])

  const createCommunityPost = useCallback(async (post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes' | 'views'>) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...post,
          upvotes: 0,
          downvotes: 0,
          views: 0
        })
        .select()
        .single()

      if (error) throw error
      
      setState(prev => ({ 
        ...prev, 
        communityPosts: [data, ...prev.communityPosts],
        loading: false 
      }))
      
      return data
    } catch (error) {
      console.error('Error creating community post:', error)
      setState(prev => ({ ...prev, error: 'Failed to create post', loading: false }))
      throw error
    }
  }, [])

  const upvoteCommunityPost = useCallback(async (postId: string) => {
    try {
      const { data, error } = await supabase.rpc('increment_upvote', { post_id: postId })
      if (error) throw error
      
      setState(prev => ({
        ...prev,
        communityPosts: prev.communityPosts.map(p => 
          p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
        )
      }))
    } catch (error) {
      console.error('Error upvoting post:', error)
      // Fallback: Update locally
      setState(prev => ({
        ...prev,
        communityPosts: prev.communityPosts.map(p => 
          p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
        )
      }))
    }
  }, [])

  // ============================================================================
  // REPUTATION ANALYTICS
  // ============================================================================

  const fetchReputationAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      let query = supabase
        .from('reputation_analytics')
        .select('*')
        .order('date', { ascending: false })

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      setState(prev => ({ ...prev, reputationAnalytics: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching reputation analytics:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch reputation analytics', 
        loading: false 
      }))
    }
  }, [])

  return {
    state,
    // Anonymous Reports
    fetchAnonymousReports,
    submitAnonymousReport,
    updateReportStatus,
    getReportByReferenceCode,
    // Social Media Mentions
    fetchSocialMediaMentions,
    createSocialMediaMention,
    updateSocialMediaMention,
    // Rumors
    fetchRumors,
    createRumor,
    updateRumor,
    // Report Responses
    fetchReportResponses,
    createReportResponse,
    // Community Posts
    fetchCommunityPosts,
    createCommunityPost,
    upvoteCommunityPost,
    // Reputation Analytics
    fetchReputationAnalytics
  }
}

