import { supabase } from './supabase';

export const api = {
  async getPosts(params = {}) {
    let query = supabase.from('posts').select('*');
    
    if (params.is_featured === 'true' || params.is_featured === true) {
      query = query.eq('is_featured', true);
    }
    
    if (params.slug) {
      query = query.eq('slug', params.slug);
    }
    
    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async getProducts(params = {}) {
    let query = supabase.from('products').select('*');
    
    if (params.is_featured === 'true' || params.is_featured === true) {
      query = query.eq('is_featured', true);
    }
    
    if (params.category_id) {
      query = query.eq('category_id', parseInt(params.category_id));
    }
    
    if (params.slug) {
      query = query.eq('slug', params.slug);
    }
    
    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async getCategories(params = {}) {
    let query = supabase.from('categories').select('*');
    if (params.type) {
      query = query.eq('type', params.type);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async getReviews(params = {}) {
    let query = supabase.from('reviews').select('*');
    if (params.product_id) {
      query = query.eq('product_id', parseInt(params.product_id));
    }
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async getVisitors() {
    const { count, error } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });
    if (error) return 0;
    return count;
  },
  
  async postData(endpoint, data) {
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
    
    if (endpoint === 'create_order.php') {
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
    
    console.warn(`postData endpoint ${endpoint} is not specifically handled`);
    return { success: false, message: 'Endpoint not implemented in Supabase migration' };
  }
};
