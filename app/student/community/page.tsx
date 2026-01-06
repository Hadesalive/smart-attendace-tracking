"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  Chip,
  Tabs,
  Tab,
  IconButton
} from "@mui/material"
import { 
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  LightBulbIcon,
  ChartBarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  EyeIcon,
  BookmarkIcon
} from "@heroicons/react/24/outline"
import { useReporting } from "@/lib/domains/reporting"
import { formatDate } from "@/lib/utils"

const POST_TYPES = [
  { value: 'all', label: 'All Posts' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'discussion', label: 'Discussions' },
  { value: 'suggestion', label: 'Suggestions' },
]

export default function StudentCommunityPage() {
  const reporting = useReporting()
  const [selectedTab, setSelectedTab] = useState(0)
  const [postType, setPostType] = useState<undefined | 'announcement' | 'discussion' | 'suggestion' | 'poll' | 'survey'>(undefined)

  useEffect(() => {
    reporting.fetchCommunityPosts(postType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postType])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
    const type = POST_TYPES[newValue].value
    setPostType(type === 'all' ? undefined : type as any)
  }

  const posts = reporting.state.communityPosts

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return MegaphoneIcon
      case 'suggestion':
        return LightBulbIcon
      case 'poll':
      case 'survey':
        return ChartBarIcon
      default:
        return ChatBubbleLeftRightIcon
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return '#000'
      case 'suggestion':
        return '#666'
      case 'poll':
      case 'survey':
        return '#999'
      default:
        return '#333'
    }
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'card-foreground',
              fontFamily: 'Poppins, sans-serif',
              mb: 1
            }}
          >
            Community
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'muted-foreground',
              fontFamily: 'DM Sans, sans-serif'
            }}
          >
            View announcements, discussions, and suggestions from the university community
          </Typography>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MUICard
          sx={{
            bgcolor: 'card',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 3,
            mb: 3
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'border',
              '& .MuiTab-root': {
                fontFamily: 'DM Sans, sans-serif',
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 64,
              }
            }}
          >
            {POST_TYPES.map((type) => (
              <Tab key={type.value} label={type.label} />
            ))}
          </Tabs>
        </MUICard>

        {reporting.state.loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
              Loading posts...
            </Typography>
          </Box>
        ) : posts.length === 0 ? (
          <MUICard
            sx={{
              bgcolor: 'card',
              border: '1px solid',
              borderColor: 'border',
              borderRadius: 3,
              textAlign: 'center',
              py: 8
            }}
          >
            <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
              No posts available
            </Typography>
          </MUICard>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {posts.map((post, index) => {
              const Icon = getPostTypeIcon(post.post_type)
              const color = getPostTypeColor(post.post_type)
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MUICard
                    sx={{
                      bgcolor: 'card',
                      border: '1px solid',
                      borderColor: post.is_pinned ? '#000' : 'border',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                          {post.is_pinned && (
                            <BookmarkIcon className="w-5 h-5" style={{ color: '#000' }} />
                          )}
                          <Icon className="w-5 h-5" style={{ color }} />
                          <Chip
                            label={post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
                            size="small"
                            sx={{
                              bgcolor: color,
                              color: 'white',
                              fontFamily: 'DM Sans, sans-serif',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                          {post.is_official && (
                            <Chip
                              label="Official"
                              size="small"
                              sx={{
                                bgcolor: '#000',
                                color: 'white',
                                fontFamily: 'DM Sans, sans-serif',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'muted-foreground',
                            fontFamily: 'DM Sans, sans-serif'
                          }}
                        >
                          {formatDate(post.created_at)}
                        </Typography>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: 'card-foreground',
                          fontFamily: 'Poppins, sans-serif',
                          mb: 1.5
                        }}
                      >
                        {post.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'muted-foreground',
                          fontFamily: 'DM Sans, sans-serif',
                          mb: 2,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {post.content}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, borderTop: '1px solid', borderColor: 'border' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton size="small" sx={{ p: 0.5 }}>
                            <HandThumbUpIcon className="w-4 h-4" style={{ color: '#666' }} />
                          </IconButton>
                          <Typography variant="caption" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                            {post.upvotes}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EyeIcon className="w-4 h-4" style={{ color: '#666' }} />
                          <Typography variant="caption" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                            {post.views} views
                          </Typography>
                        </Box>
                      </Box>
                    </MUICardContent>
                  </MUICard>
                </motion.div>
              )
            })}
          </Box>
        )}
      </motion.div>
    </Box>
  )
}

