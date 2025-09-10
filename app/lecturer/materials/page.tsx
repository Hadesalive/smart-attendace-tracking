"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DocumentTextIcon, PlusIcon, FolderIcon, DocumentIcon, VideoCameraIcon, PhotoIcon, LinkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { formatDate, formatFileSize } from "@/lib/utils"

export default function MaterialsPage() {
  // Mock data - replace with actual data fetching
  const courses = [
    {
      id: "1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      materialsCount: 12,
      lastUpdated: "2024-01-20"
    },
    {
      id: "2",
      courseCode: "MATH201",
      courseName: "Calculus II",
      materialsCount: 8,
      lastUpdated: "2024-01-18"
    },
    {
      id: "3",
      courseCode: "ENG101",
      courseName: "English Composition",
      materialsCount: 15,
      lastUpdated: "2024-01-19"
    }
  ]

  const recentMaterials = [
    {
      id: "1",
      title: "Data Structures Lecture Notes",
      courseCode: "CS101",
      type: "document",
      size: 2048576, // 2MB
      uploadedBy: "Dr. Smith",
      uploadedAt: "2024-01-20T10:30:00",
      downloads: 42,
      status: "published"
    },
    {
      id: "2",
      title: "Integration Techniques Video",
      courseCode: "MATH201",
      type: "video",
      size: 52428800, // 50MB
      uploadedBy: "Prof. Johnson",
      uploadedAt: "2024-01-19T14:15:00",
      downloads: 38,
      status: "published"
    },
    {
      id: "3",
      title: "Research Paper Guidelines",
      courseCode: "ENG101",
      type: "document",
      size: 1024000, // 1MB
      uploadedBy: "Dr. Williams",
      uploadedAt: "2024-01-18T16:45:00",
      downloads: 30,
      status: "draft"
    },
    {
      id: "4",
      title: "Algorithm Visualization",
      courseCode: "CS101",
      type: "image",
      size: 512000, // 512KB
      uploadedBy: "Dr. Smith",
      uploadedAt: "2024-01-17T09:20:00",
      downloads: 25,
      status: "published"
    }
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <DocumentIcon className="h-5 w-5 text-blue-500" />
      case "video":
        return <VideoCameraIcon className="h-5 w-5 text-red-500" />
      case "image":
        return <PhotoIcon className="h-5 w-5 text-green-500" />
      case "link":
        return <LinkIcon className="h-5 w-5 text-purple-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lesson Materials</h1>
          <p className="text-muted-foreground">Manage and organize course materials and resources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FolderIcon className="h-4 w-4 mr-2" />
            Organize
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload Material
          </Button>
        </div>
      </div>

      {/* Course Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <FolderIcon className="h-8 w-8 text-primary" />
                <Badge variant="outline">{formatNumber(course.materialsCount)} files</Badge>
              </div>
              <CardTitle className="text-lg">{course.courseCode}</CardTitle>
              <CardDescription>{course.courseName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Materials</span>
                  <span className="font-medium">{formatNumber(course.materialsCount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span className="font-medium">{formatDate(course.lastUpdated)}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View Materials
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Materials</CardTitle>
          <CardDescription>Latest uploaded course materials and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(material.type)}
                      <div>
                        <div className="font-medium">{material.title}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {material.type}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{material.courseCode}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {material.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(material.size)}</TableCell>
                  <TableCell>{material.uploadedBy}</TableCell>
                  <TableCell>{formatDate(material.uploadedAt)}</TableCell>
                  <TableCell>{formatNumber(material.downloads)}</TableCell>
                  <TableCell>{getStatusBadge(material.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <ArrowDownTrayIcon className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <DocumentIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Upload Document</h3>
            <p className="text-sm text-muted-foreground">PDF, Word, PowerPoint</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <VideoCameraIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Upload Video</h3>
            <p className="text-sm text-muted-foreground">MP4, MOV, AVI</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <PhotoIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Upload Image</h3>
            <p className="text-sm text-muted-foreground">JPG, PNG, GIF</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <LinkIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Add Link</h3>
            <p className="text-sm text-muted-foreground">External resources</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}