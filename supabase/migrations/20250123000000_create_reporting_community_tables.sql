-- Migration: Student Reporting & Community Features
-- Creates tables for anonymous reporting, social media monitoring, and community engagement

-- ============================================================================
-- 1. ANONYMOUS REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS anonymous_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type VARCHAR(50) CHECK (report_type IN (
    'opinion_suggestion',
    'concern_complaint',
    'incident_report',
    'feedback_teaching',
    'feedback_course',
    'feedback_administrative',
    'feedback_services'
  )) NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  urgency_level VARCHAR(20) CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  location_context TEXT,
  attachment_urls JSONB, -- Array of file URLs
  status VARCHAR(20) CHECK (status IN ('submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed')) DEFAULT 'submitted',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 0, -- 0 = normal, higher = more urgent
  internal_notes TEXT, -- Admin-only notes
  response_text TEXT, -- Admin response
  resolved_at TIMESTAMP WITH TIME ZONE,
  reference_code VARCHAR(50) UNIQUE, -- Anonymous reference code for tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. SOCIAL MEDIA MENTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_media_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(50) CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin', 'reddit', 'other')) NOT NULL,
  mention_url TEXT NOT NULL,
  content TEXT NOT NULL,
  author_handle VARCHAR(255),
  author_name VARCHAR(255),
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')) DEFAULT 'neutral',
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  category VARCHAR(100),
  tags TEXT[], -- Array of tags
  is_rumor BOOLEAN DEFAULT false,
  rumor_id UUID, -- References rumors table if this is a rumor
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('new', 'reviewed', 'responded', 'resolved', 'ignored')) DEFAULT 'new',
  response_url TEXT, -- Link to official response
  response_text TEXT, -- Official response text
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  engagement_count INTEGER DEFAULT 0, -- Likes, shares, etc.
  mention_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. RUMORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rumors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  source VARCHAR(255), -- Where the rumor originated
  source_type VARCHAR(50) CHECK (source_type IN ('social_media', 'student_report', 'internal', 'external', 'unknown')) DEFAULT 'unknown',
  spread_level VARCHAR(20) CHECK (spread_level IN ('contained', 'limited', 'moderate', 'widespread', 'viral')) DEFAULT 'limited',
  impact_assessment TEXT,
  verification_status VARCHAR(20) CHECK (verification_status IN ('unverified', 'fact_checking', 'verified_true', 'verified_false', 'partially_true', 'misleading')) DEFAULT 'unverified',
  truth_status VARCHAR(20) CHECK (truth_status IN ('true', 'false', 'partially_true', 'misleading', 'unverifiable')) DEFAULT 'unverifiable',
  official_response_id UUID, -- References report_responses if official response exists
  response_url TEXT,
  response_text TEXT,
  categories TEXT[], -- Array of categories
  tags TEXT[], -- Array of tags
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('active', 'being_addressed', 'resolved', 'dismissed')) DEFAULT 'active',
  resolved_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. REPORT RESPONSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES anonymous_reports(id) ON DELETE CASCADE,
  response_type VARCHAR(50) CHECK (response_type IN ('internal', 'public', 'official_statement')) NOT NULL,
  response_text TEXT NOT NULL,
  response_url TEXT, -- Link to public response if applicable
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_template BOOLEAN DEFAULT false,
  template_name VARCHAR(255), -- If this is a reusable template
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. COMMUNITY POSTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_type VARCHAR(50) CHECK (post_type IN ('announcement', 'discussion', 'suggestion', 'poll', 'survey')) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous posts
  is_anonymous BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false, -- Official university announcements
  category VARCHAR(100),
  tags TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived', 'removed')) DEFAULT 'draft',
  is_pinned BOOLEAN DEFAULT false,
  pinned_until TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. REPUTATION ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reputation_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  overall_sentiment_score DECIMAL(3,2) NOT NULL, -- -1.0 to 1.0
  positive_mentions_count INTEGER DEFAULT 0,
  negative_mentions_count INTEGER DEFAULT 0,
  neutral_mentions_count INTEGER DEFAULT 0,
  total_mentions_count INTEGER DEFAULT 0,
  platform_breakdown JSONB, -- {twitter: {positive: X, negative: Y}, ...}
  topic_breakdown JSONB, -- {academic: X, facilities: Y, ...}
  reputation_score DECIMAL(5,2) NOT NULL, -- 0-100 scale
  trend_direction VARCHAR(20) CHECK (trend_direction IN ('improving', 'stable', 'declining')) DEFAULT 'stable',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_anonymous_reports_status ON anonymous_reports(status);
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_type ON anonymous_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_created_at ON anonymous_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_reference_code ON anonymous_reports(reference_code);

CREATE INDEX IF NOT EXISTS idx_social_media_mentions_platform ON social_media_mentions(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_mentions_sentiment ON social_media_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_social_media_mentions_status ON social_media_mentions(status);
CREATE INDEX IF NOT EXISTS idx_social_media_mentions_mention_date ON social_media_mentions(mention_date);

CREATE INDEX IF NOT EXISTS idx_rumors_status ON rumors(status);
CREATE INDEX IF NOT EXISTS idx_rumors_verification_status ON rumors(verification_status);
CREATE INDEX IF NOT EXISTS idx_rumors_created_at ON rumors(created_at);

CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_pinned ON community_posts(is_pinned);

CREATE INDEX IF NOT EXISTS idx_reputation_analytics_date ON reputation_analytics(date);

-- ============================================================================
-- 8. FUNCTIONS FOR AUTO-GENERATING REFERENCE CODES
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_report_reference_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := 'RPT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_report_reference_code
  BEFORE INSERT ON anonymous_reports
  FOR EACH ROW
  EXECUTE FUNCTION generate_report_reference_code();

-- ============================================================================
-- 9. UPDATE TIMESTAMP FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_anonymous_reports_updated_at
  BEFORE UPDATE ON anonymous_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_mentions_updated_at
  BEFORE UPDATE ON social_media_mentions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rumors_updated_at
  BEFORE UPDATE ON rumors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_responses_updated_at
  BEFORE UPDATE ON report_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Anonymous reports: Students can only insert, admins can view all
ALTER TABLE anonymous_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can submit anonymous reports"
  ON anonymous_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Anyone authenticated can submit (anonymously)

CREATE POLICY "Admins can view all reports"
  ON anonymous_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports"
  ON anonymous_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Social media mentions: Admins only
ALTER TABLE social_media_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage social media mentions"
  ON social_media_mentions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Rumors: Admins only
ALTER TABLE rumors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rumors"
  ON rumors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Report responses: Admins only
ALTER TABLE report_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage report responses"
  ON report_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Community posts: All authenticated users can view published, students/admins can create
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view published community posts"
  ON community_posts
  FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Students and admins can create community posts"
  ON community_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all community posts"
  ON community_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update their own community posts"
  ON community_posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- Reputation analytics: Admins only
ALTER TABLE reputation_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reputation analytics"
  ON reputation_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

