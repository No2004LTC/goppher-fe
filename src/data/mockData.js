export const currentUser = {
  id: 1,
  username: 'minh.dev',
  email: 'minh@example.com',
  full_name: 'Nguyễn Minh',
  avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
};

export const users = [
  {
    id: 2,
    username: 'linh.tran',
    email: 'linh@example.com',
    full_name: 'Trần Linh',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  },
  {
    id: 3,
    username: 'hung.nguyen',
    email: 'hung@example.com',
    full_name: 'Nguyễn Hùng',
    avatar_url: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  },
  {
    id: 4,
    username: 'mai.pham',
    email: 'mai@example.com',
    full_name: 'Phạm Mai',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  },
  {
    id: 5,
    username: 'duc.le',
    email: 'duc@example.com',
    full_name: 'Lê Đức',
    avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  },
];

export const posts = [
  {
    id: 1,
    user_id: 2,
    author_name: 'Trần Linh',
    author_avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    content: 'Buổi chiều thật đẹp! Vừa đi dạo về và cảm thấy rất thư thái. Các bạn đang làm gì vậy? ☀️',
    image_url: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=600&fit=crop',
    likes_count: 42,
    comments_count: 8,
    created_at: '2026-04-11T14:30:00Z',
  },
  {
    id: 2,
    user_id: 3,
    author_name: 'Nguyễn Hùng',
    author_avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    content: 'Vừa hoàn thành project React mới. Cảm giác khi debug xong một lỗi khó thật sự rất tuyệt vời! 🚀 #ReactJS #WebDev',
    image_url: null,
    likes_count: 128,
    comments_count: 23,
    created_at: '2026-04-11T12:00:00Z',
  },
  {
    id: 3,
    user_id: 4,
    author_name: 'Phạm Mai',
    author_avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    content: 'Bữa trưa hôm nay ngon quá! Mọi người có muốn biết địa chỉ nhà hàng không? 🍜',
    image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&fit=crop',
    likes_count: 76,
    comments_count: 15,
    created_at: '2026-04-11T11:30:00Z',
  },
  {
    id: 4,
    user_id: 5,
    author_name: 'Lê Đức',
    author_avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    content: 'Chuyến du lịch Đà Lạt cuối tuần vừa rồi thật tuyệt vời. Ai muốn cùng đi lần sau không? Mình đang plan cho tháng 5! 🏔️',
    image_url: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600&fit=crop',
    likes_count: 201,
    comments_count: 47,
    created_at: '2026-04-10T20:00:00Z',
  },
];

export const conversations = [
  {
    id: 1,
    user: users[0],
    last_message: 'Bạn có rảnh không?',
    last_time: '14:32',
    unread: 2,
  },
  {
    id: 2,
    user: users[1],
    last_message: 'Ok mình sẽ gửi file sau nhé',
    last_time: '12:10',
    unread: 0,
  },
  {
    id: 3,
    user: users[2],
    last_message: 'Cảm ơn bạn nhiều lắm! 😊',
    last_time: 'Hôm qua',
    unread: 0,
  },
  {
    id: 4,
    user: users[3],
    last_message: 'Hẹn gặp lại nhé',
    last_time: 'Thứ 2',
    unread: 0,
  },
];

export const initialMessages = {
  1: [
    {
      id: 1,
      sender_id: 2,
      receiver_id: 1,
      content: 'Chào Minh! Bạn khỏe không?',
      created_at: '2026-04-11T14:00:00Z',
    },
    {
      id: 2,
      sender_id: 1,
      receiver_id: 2,
      content: 'Chào Linh! Mình khỏe, bạn thì sao?',
      created_at: '2026-04-11T14:05:00Z',
    },
    {
      id: 3,
      sender_id: 2,
      receiver_id: 1,
      content: 'Mình cũng khỏe. Bạn có rảnh không?',
      created_at: '2026-04-11T14:32:00Z',
    },
  ],
  2: [
    {
      id: 4,
      sender_id: 3,
      receiver_id: 1,
      content: 'Minh ơi, file project đã xong chưa?',
      created_at: '2026-04-11T11:00:00Z',
    },
    {
      id: 5,
      sender_id: 1,
      receiver_id: 3,
      content: 'Gần xong rồi bạn ơi, chờ mình chút',
      created_at: '2026-04-11T11:30:00Z',
    },
    {
      id: 6,
      sender_id: 3,
      receiver_id: 1,
      content: 'Ok mình sẽ gửi file sau nhé',
      created_at: '2026-04-11T12:10:00Z',
    },
  ],
};

export const autoReplies = [
  'Được rồi bạn nhé! 😊',
  'Mình hiểu rồi, cảm ơn bạn!',
  'Ok ok, để mình kiểm tra lại',
  'Hay quá! Mình sẽ thử ngay',
  'Bạn nói đúng rồi đó 👍',
  'Haha, vui quá!',
  'Mình đang bận một chút, lát nữa nhé',
  'Tuyệt vời! Cảm ơn bạn nhiều lắm!',
];
