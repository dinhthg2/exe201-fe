//import enums.ts if any

// Enums for StudyMate dashboard components
export enum UserRole {
  STUDENT = 'student',
  TUTOR = 'tutor', 
  ADMIN = 'admin'
}

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  COMPLETED = 'completed', 
  DROPPED = 'dropped',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress'
}

export enum NotificationType {
  MATCH = 'match',
  MESSAGE = 'message',
  COURSE = 'course',
  SYSTEM = 'system',
  REVIEW = 'review'
}

export enum ActivityType {
  REVIEW_WRITTEN = 'review_written',
  MATCH = 'match',
  COURSE_COMPLETED = 'course_completed', 
  SWIPE = 'swipe'
}

export enum Specialization {
  SOFTWARE_ENGINEERING = 'Kỹ thuật phần mềm',
  ARTIFICIAL_INTELLIGENCE = 'Trí tuệ nhân tạo',
  MARKETING = 'Marketing',
  MULTIMEDIA_COMMUNICATIONS = 'Truyền thông đa phương tiện',
  DIGITAL_ART_DESIGN = 'Thiết kế mỹ thuật số'
}

// Data passed as props to the root component
export const mockRootProps = {
  user: {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@student.fpt.edu.vn',
    role: UserRole.STUDENT as const,
    student_id: 'SE170001',
    specialization: Specialization.SOFTWARE_ENGINEERING as const,
    semester: 5,
    gpa: 3.75,
    bio: 'Sinh viên năm 3 chuyên ngành Kỹ thuật phần mềm, đam mê lập trình web và mobile app development.',
    interests: ['React', 'Node.js', 'Machine Learning', 'UI/UX Design'],
    phone: '0123456789',
    address: 'Hà Nội, Việt Nam',
    date_of_birth: '2002-05-15T00:00:00.000Z',
    avatar: 'https://i.pravatar.cc/150?img=1',
    age: 22,
    subject: 'Kỹ thuật phần mềm',
    location: 'Hà Nội',
    available_time: 'Tối thứ 2-6, Cuối tuần',
    is_approved: true,
    allow_discovery: true,
    created_at: '2023-09-01T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  achievements: {
    total_enrollments: 8,
    completed_courses: 5,
    active_courses: 3,
    reviews_written: 12,
    matches_found: 15,
    swipes: 45,
    materials_downloaded: null
  },
  enrollments: [
    {
      id: 1,
      course_id: 101,
      course_title: 'React Advanced Patterns',
      subject: 'Frontend Development',
      status: EnrollmentStatus.IN_PROGRESS as const,
      progress: 75,
      final_grade: null,
      enrolled_at: '2024-01-10T00:00:00.000Z',
      updated_at: '2024-01-20T00:00:00.000Z'
    },
    {
      id: 2,
      course_id: 102,
      course_title: 'Database Design & Management',
      subject: 'Backend Development',
      status: EnrollmentStatus.COMPLETED as const,
      progress: 100,
      final_grade: 8.5,
      enrolled_at: '2023-12-01T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 3,
      course_id: 103,
      course_title: 'Mobile App Development',
      subject: 'Mobile Development',
      status: EnrollmentStatus.IN_PROGRESS as const,
      progress: 45,
      final_grade: null,
      enrolled_at: '2024-01-05T00:00:00.000Z',
      updated_at: '2024-01-18T00:00:00.000Z'
    }
  ],
  connections: [
    {
      id: 2,
      name: 'Trần Thị Bình',
      email: 'binh.tran@student.fpt.edu.vn',
      specialization: Specialization.SOFTWARE_ENGINEERING as const,
      semester: 5,
      avatar: 'https://i.pravatar.cc/150?img=2',
      common_courses: 3
    },
    {
      id: 3,
      name: 'Lê Văn Cường',
      email: 'cuong.le@student.fpt.edu.vn',
      specialization: Specialization.ARTIFICIAL_INTELLIGENCE as const,
      semester: 6,
      avatar: 'https://i.pravatar.cc/150?img=3',
      common_courses: 2
    },
    {
      id: 4,
      name: 'Phạm Thị Dung',
      email: 'dung.pham@student.fpt.edu.vn',
      specialization: Specialization.MARKETING as const,
      semester: 4,
      avatar: 'https://i.pravatar.cc/150?img=4',
      common_courses: 1
    }
  ],
  tutors: [
    {
      id: 10,
      name: 'Phạm Minh Đức',
      email: 'duc.pham@tutor.fpt.edu.vn',
      subjects: ['React', 'Node.js', 'JavaScript'],
      rating: 4.8,
      price_per_hour: 200000,
      avatar: 'https://i.pravatar.cc/150?img=10',
      bio: 'Senior Developer với 5 năm kinh nghiệm, chuyên về Full-stack JavaScript development.'
    },
    {
      id: 11,
      name: 'Nguyễn Thị Lan',
      email: 'lan.nguyen@tutor.fpt.edu.vn',
      subjects: ['Python', 'Machine Learning', 'Data Science'],
      rating: 4.9,
      price_per_hour: 250000,
      avatar: 'https://i.pravatar.cc/150?img=11',
      bio: 'Data Scientist với chuyên môn về AI và Machine Learning, có kinh nghiệm giảng dạy 3 năm.'
    }
  ],
  activities: [
    {
      type: ActivityType.MATCH as const,
      id: 'match_1',
      other_user_id: 2,
      created_at: '2024-01-20T10:30:00.000Z'
    },
    {
      type: ActivityType.COURSE_COMPLETED as const,
      id: 'enroll_2',
      course_id: 102,
      created_at: '2024-01-15T14:20:00.000Z'
    },
    {
      type: ActivityType.REVIEW_WRITTEN as const,
      id: 'review_1',
      target_id: 10,
      created_at: '2024-01-18T16:45:00.000Z'
    }
  ],
  notifications: [
    {
      id: 1,
      type: NotificationType.MATCH as const,
      title: 'Bạn đã ghép đôi thành công!',
      message: 'Bạn và Trần Thị Bình đã ghép đôi. Hãy bắt đầu trò chuyện!',
      read: false,
      created_at: '2024-01-20T10:30:00.000Z',
      data: {
        match_id: 1,
        other_user_id: 2
      }
    },
    {
      id: 2,
      type: NotificationType.COURSE as const,
      title: 'Bài tập mới được giao',
      message: 'Bạn có 1 bài tập mới trong khóa React Advanced Patterns',
      read: true,
      created_at: '2024-01-19T09:15:00.000Z',
      data: {
        course_id: 101
      }
    },
    {
      id: 3,
      type: NotificationType.MESSAGE as const,
      title: 'Tin nhắn mới',
      message: 'Lê Văn Cường đã gửi tin nhắn cho bạn',
      read: false,
      created_at: '2024-01-21T08:20:00.000Z',
      data: {
        sender_id: 3
      }
    }
  ],
  schedule: [
    {
      id: 'course_101',
      course_title: 'React Advanced Patterns',
      subject: 'Frontend Development',
      instructor: 'Nguyễn Văn Tutor',
      type: 'lecture',
      status: 'upcoming',
      time: '08:00 - 10:00',
      room: 'Room 301',
      date: '2024-01-22'
    },
    {
      id: 'course_103',
      course_title: 'Mobile App Development',
      subject: 'Mobile Development',
      instructor: 'Lê Thị Mentor',
      type: 'lab',
      status: 'upcoming',
      time: '14:00 - 16:00',
      room: 'Lab 205',
      date: '2024-01-22'
    },
    {
      id: 'course_104',
      course_title: 'Database Systems',
      subject: 'Backend Development',
      instructor: 'Trần Văn Expert',
      type: 'lecture',
      status: 'completed',
      time: '10:00 - 12:00',
      room: 'Room 402',
      date: '2024-01-21'
    }
  ]
};