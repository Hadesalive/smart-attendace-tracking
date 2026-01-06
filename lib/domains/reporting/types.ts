// Reporting & Community Domain Types

export interface AnonymousReport {
  id: string
  report_type: 'opinion_suggestion' | 'concern_complaint' | 'incident_report' | 'feedback_teaching' | 'feedback_course' | 'feedback_administrative' | 'feedback_services'
  category: string
  title: string
  description: string
  urgency_level: 'low' | 'medium' | 'high' | 'critical'
  location_context?: string
  attachment_urls?: string[]
  status: 'submitted' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  assigned_to?: string
  priority: number
  internal_notes?: string
  response_text?: string
  resolved_at?: string
  reference_code: string
  created_at: string
  updated_at: string
}

export interface SocialMediaMention {
  id: string
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'reddit' | 'other'
  mention_url: string
  content: string
  author_handle?: string
  author_name?: string
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  sentiment_score?: number
  category?: string
  tags?: string[]
  is_rumor: boolean
  rumor_id?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'reviewed' | 'responded' | 'resolved' | 'ignored'
  response_url?: string
  response_text?: string
  assigned_to?: string
  engagement_count: number
  mention_date: string
  created_at: string
  updated_at: string
}

export interface Rumor {
  id: string
  title: string
  description: string
  source?: string
  source_type: 'social_media' | 'student_report' | 'internal' | 'external' | 'unknown'
  spread_level: 'contained' | 'limited' | 'moderate' | 'widespread' | 'viral'
  impact_assessment?: string
  verification_status: 'unverified' | 'fact_checking' | 'verified_true' | 'verified_false' | 'partially_true' | 'misleading'
  truth_status: 'true' | 'false' | 'partially_true' | 'misleading' | 'unverifiable'
  official_response_id?: string
  response_url?: string
  response_text?: string
  categories?: string[]
  tags?: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'being_addressed' | 'resolved' | 'dismissed'
  resolved_at?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface ReportResponse {
  id: string
  report_id: string
  response_type: 'internal' | 'public' | 'official_statement'
  response_text: string
  response_url?: string
  created_by?: string
  is_template: boolean
  template_name?: string
  created_at: string
  updated_at: string
}

export interface CommunityPost {
  id: string
  post_type: 'announcement' | 'discussion' | 'suggestion' | 'poll' | 'survey'
  title: string
  content: string
  author_id?: string
  is_anonymous: boolean
  is_official: boolean
  category?: string
  tags?: string[]
  upvotes: number
  downvotes: number
  views: number
  status: 'draft' | 'published' | 'archived' | 'removed'
  is_pinned: boolean
  pinned_until?: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface ReputationAnalytics {
  id: string
  date: string
  overall_sentiment_score: number
  positive_mentions_count: number
  negative_mentions_count: number
  neutral_mentions_count: number
  total_mentions_count: number
  platform_breakdown?: Record<string, any>
  topic_breakdown?: Record<string, any>
  reputation_score: number
  trend_direction: 'improving' | 'stable' | 'declining'
  notes?: string
  created_at: string
}

export interface ReportingState {
  anonymousReports: AnonymousReport[]
  socialMediaMentions: SocialMediaMention[]
  rumors: Rumor[]
  reportResponses: ReportResponse[]
  communityPosts: CommunityPost[]
  reputationAnalytics: ReputationAnalytics[]
  loading: boolean
  error: string | null
}

