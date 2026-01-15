/**
 * API MODULE - Tầng truy cập dữ liệu
 * 
 * Module này chứa tất cả các hàm gọi API đến Supabase
 * Cung cấp interface thống nhất cho việc truy xuất và thao tác dữ liệu
 */

import { supabase } from './supabase';

/**
 * Object chứa tất cả các phương thức API
 * Sử dụng: import { api } from '@/lib/api'
 */
export const api = {
  // ==================== BÀI VIẾT (POSTS) ====================
  /**
   * Lấy danh sách bài viết
   * @param {Object} params - Các tham số lọc
   * @param {boolean} params.is_featured - Lọc bài viết nổi bật
   * @param {string} params.slug - Lọc theo slug
   * @param {number} params.limit - Giới hạn số lượng kết quả
   * @returns {Array} Danh sách bài viết
   */
  async getPosts(params = {}) {
    let query = supabase.from('posts').select('*');
    
    // Lọc bài viết nổi bật
    if (params.is_featured === 'true' || params.is_featured === true) {
      query = query.eq('is_featured', true);
    }
    
    // Lọc theo slug (dùng cho trang chi tiết)
    if (params.slug) {
      query = query.eq('slug', params.slug);
    }
    
    // Giới hạn số lượng kết quả
    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }
    
    // Sắp xếp theo thời gian tạo mới nhất
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // ==================== SẢN PHẨM (PRODUCTS) ====================
  /**
   * Lấy danh sách sản phẩm
   * @param {Object} params - Các tham số lọc
   * @param {boolean} params.is_featured - Lọc sản phẩm nổi bật
   * @param {number} params.category_id - Lọc theo danh mục
   * @param {string} params.slug - Lọc theo slug
   * @param {number} params.limit - Giới hạn số lượng kết quả
   * @returns {Array} Danh sách sản phẩm
   */
  async getProducts(params = {}) {
    let query = supabase.from('products').select('*');
    
    // Lọc sản phẩm nổi bật
    if (params.is_featured === 'true' || params.is_featured === true) {
      query = query.eq('is_featured', true);
    }
    
    // Lọc theo danh mục
    if (params.category_id) {
      query = query.eq('category_id', parseInt(params.category_id));
    }
    
    // Lọc theo slug (dùng cho trang chi tiết)
    if (params.slug) {
      query = query.eq('slug', params.slug);
    }
    
    // Giới hạn số lượng kết quả
    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }
    
    // Sắp xếp theo thời gian tạo mới nhất
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // ==================== DANH MỤC (CATEGORIES) ====================
  /**
   * Lấy danh sách danh mục
   * @param {Object} params - Các tham số lọc
   * @param {string} params.type - Loại danh mục (product, post, ...)
   * @returns {Array} Danh sách danh mục
   */
  async getCategories(params = {}) {
    let query = supabase.from('categories').select('*');
    
    // Lọc theo loại danh mục
    if (params.type) {
      query = query.eq('type', params.type);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // ==================== ĐÁNH GIÁ (REVIEWS) ====================
  /**
   * Lấy danh sách đánh giá
   * @param {Object} params - Các tham số lọc
   * @param {number} params.product_id - Lọc theo sản phẩm
   * @returns {Array} Danh sách đánh giá
   */
  async getReviews(params = {}) {
    let query = supabase.from('reviews').select('*');
    
    // Lọc theo sản phẩm
    if (params.product_id) {
      query = query.eq('product_id', parseInt(params.product_id));
    }
    
    // Sắp xếp theo thời gian mới nhất
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // ==================== THỐNG KÊ TRUY CẬP (VISITORS) ====================
  /**
   * Lấy tổng số lượt truy cập website
   * @returns {number} Số lượt truy cập
   */
  async getVisitors() {
    try {
      const { count, error } = await supabase
        .from('visitors')
        .select('id', { count: 'exact' })
        .limit(0);
      
      if (error) {
        console.error('Supabase error in getVisitors:', error);
        return 0;
      }
      return count || 0;
    } catch (err) {
      console.error('Unexpected error in getVisitors:', err);
      return 0;
    }
  },
  
  // ==================== CÂU LẠC BỘ (CLUBS) ====================
  /**
   * Lấy danh sách tất cả câu lạc bộ
   * Bao gồm số lượng thành viên
   * @returns {Array} Danh sách câu lạc bộ
   */
  async getClubs() {
    const { data, error } = await supabase
      .from('clubs')
      .select('*, club_members(count)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Lấy thông tin chi tiết của một câu lạc bộ theo ID
   * @param {number} id - ID của câu lạc bộ
   * @returns {Object} Thông tin câu lạc bộ
   */
  async getClubById(id) {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Tạo câu lạc bộ mới
   * @param {Object} clubData - Dữ liệu câu lạc bộ mới
   * @returns {Object} Câu lạc bộ vừa tạo
   */
  async createClub(clubData) {
    const { data, error } = await supabase
      .from('clubs')
      .insert(clubData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Lấy danh sách thành viên của câu lạc bộ
   * Bao gồm thông tin profile của từng thành viên
   * @param {number} clubId - ID của câu lạc bộ
   * @returns {Array} Danh sách thành viên
   */
  async getClubMembers(clubId) {
    const { data, error } = await supabase
      .from('club_members')
      .select('*, profiles(*)')
      .eq('club_id', clubId);
    
    if (error) throw error;
    return data;
  },

  /**
   * Lấy danh sách bài viết của câu lạc bộ
   * @param {number} clubId - ID của câu lạc bộ
   * @returns {Array} Danh sách bài viết
   */
  async getClubPosts(clubId) {
    const { data, error } = await supabase
      .from('club_posts')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Kiểm tra xem người dùng có đang theo dõi câu lạc bộ không
   * @param {number} clubId - ID của câu lạc bộ
   * @param {string} userId - ID của người dùng
   * @returns {boolean} true nếu đang theo dõi, false nếu không
   */
  async getFollowStatus(clubId, userId) {
    const { data, error } = await supabase
      .from('club_follows')
      .select('*')
      .eq('club_id', clubId)
      .eq('profile_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },

  /**
   * Thêm hoặc bỏ theo dõi câu lạc bộ
   * @param {number} clubId - ID của câu lạc bộ
   * @param {string} userId - ID của người dùng
   * @param {boolean} isFollowing - Trạng thái hiện tại (true = đang theo dõi)
   */
  async toggleFollowClub(clubId, userId, isFollowing) {
    if (isFollowing) {
      // Nếu đang theo dõi -> bỏ theo dõi
      const { error } = await supabase
        .from('club_follows')
        .delete()
        .eq('club_id', clubId)
        .eq('profile_id', userId);
      
      if (error) throw error;
    } else {
      // Nếu chưa theo dõi -> thêm theo dõi
      const { error } = await supabase
        .from('club_follows')
        .insert({ club_id: clubId, profile_id: userId });
      
      if (error) throw error;
    }
  },

  // ==================== SỰ KIỆN (EVENTS) ====================
  /**
   * Lấy danh sách tất cả sự kiện
   * Sắp xếp theo ngày diễn ra (sự kiện sắp tới lên đầu)
   * @returns {Array} Danh sách sự kiện
   */
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Lấy thông tin chi tiết của một sự kiện theo ID
   * @param {number} id - ID của sự kiện
   * @returns {Object} Thông tin sự kiện
   */
  async getEventById(id) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Lấy đăng ký của người dùng cho một sự kiện cụ thể
   * @param {number} eventId - ID của sự kiện
   * @param {string} userId - ID của người dùng
   * @returns {Object|null} Thông tin đăng ký hoặc null
   */
  async getUserRegistration(eventId, userId) {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  /**
   * Xóa đăng ký sự kiện
   * @param {number} id - ID của đăng ký cần xóa
   * @returns {boolean} true nếu xóa thành công
   */
  async deleteRegistration(id) {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // ==================== POST DATA (LEGACY ENDPOINTS) ====================
  /**
   * Gửi dữ liệu đến các endpoint cụ thể
   * Hàm này mô phỏng các endpoint PHP cũ
   * @param {string} endpoint - Tên endpoint (VD: 'submit_review.php')
   * @param {Object} data - Dữ liệu cần gửi
   * @returns {Object} Kết quả từ database
   */
  async postData(endpoint, data) {
    // Xử lý endpoint gửi đánh giá sản phẩm
    if (endpoint === 'submit_review.php') {
      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          product_id: parseInt(data.product_id),
          user_id: data.user_id,
          user_name: data.user_name,
          rating: parseInt(data.rating),
          comment: data.comment
        })
        .select()
        .single();
      
      if (error) return { error: error.message };
      return review;
    }
    
    // Xử lý endpoint tạo đơn hàng mới
    if (endpoint === 'create_order.php') {
      // Bước 1: Tạo đơn hàng
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: data.user_id,
          total_amount: parseFloat(data.total_amount),
          status: 'pending',
          shipping_address: data.shipping_address,
          phone_number: data.phone_number,
          full_name: data.full_name,
          payment_method: data.payment_method
        })
        .select()
        .single();
      
      if (orderError) return { error: orderError.message };
      
      // Bước 2: Thêm các sản phẩm vào đơn hàng
      if (data.items && data.items.length > 0) {
        const orderItems = data.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        }));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
          
        if (itemsError) return { error: itemsError.message };
      }
      
      return order;
    }

    // Xử lý endpoint đăng ký sự kiện
    if (endpoint === 'create_registration.php') {
      const { data: registration, error } = await supabase
        .from('registrations')
        .insert({
          event_id: data.event_id,
          user_id: data.user_id,
          full_name: data.full_name,
          email: data.email,
          distance: data.distance,
          payment_status: 'pending'
        })
        .select()
        .single();
      
      if (error) return { error: error.message };
      return registration;
    }
    
    // Cảnh báo nếu endpoint chưa được implement
    console.warn(`postData endpoint ${endpoint} is not specifically handled`);
    return { success: false, message: 'Endpoint not implemented in Supabase migration' };
  }
};
