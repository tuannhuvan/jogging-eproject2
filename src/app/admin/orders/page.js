/**
 * ADMIN ORDERS PAGE - Trang quản lý đơn hàng
 * 
 * Chức năng:
 * - Hiển thị danh sách đơn hàng
 * - Lọc theo trạng thái (pending, confirmed, shipping, completed, cancelled)
 * - Tìm kiếm theo tên khách hàng, số điện thoại
 * - Cập nhật trạng thái đơn hàng (quan trọng với COD)
 * - Xem chi tiết đơn hàng
 * 
 * Trạng thái đơn hàng:
 * - pending: Chờ xác nhận
 * - confirmed: Đã xác nhận
 * - shipping: Đang giao hàng
 * - completed: Hoàn thành (đã giao + đã thanh toán)
 * - cancelled: Đã hủy
 * 
 * Trạng thái thanh toán:
 * - pending: Chờ thanh toán (MoMo)
 * - cod_pending: Chờ thanh toán COD
 * - paid: Đã thanh toán
 * - failed: Thanh toán thất bại
 */
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Package, Eye, Truck, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function OrdersPage() {
  // === STATE ===
  // Danh sách đơn hàng
  const [orders, setOrders] = useState([])
  // Trạng thái loading
  const [loading, setLoading] = useState(true)
  // Từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  // Bộ lọc trạng thái
  const [statusFilter, setStatusFilter] = useState('all')
  // Đơn hàng đang xem chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null)
  // Loading khi cập nhật trạng thái
  const [updating, setUpdating] = useState(false)

  // === LOAD DATA ===
  useEffect(() => {
    fetchOrders()
  }, [])

  /**
   * Lấy danh sách đơn hàng từ database
   * Join với profiles để lấy thông tin khách hàng
   */
  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (full_name, email, phone, address)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @param {string} newStatus - Trạng thái mới
   */
  async function updateOrderStatus(orderId, newStatus) {
    setUpdating(true)
    
    // Chuẩn bị dữ liệu update
    const updateData = { status: newStatus }
    
    // Nếu chuyển sang completed và là COD, cập nhật payment_status
    if (newStatus === 'completed') {
      const order = orders.find(o => o.id === orderId)
      if (order?.payment_method === 'cod') {
        updateData.payment_status = 'paid'
      }
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      toast.error('Không thể cập nhật trạng thái: ' + error.message)
    } else {
      toast.success('Cập nhật trạng thái thành công')
      // Cập nhật state
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, ...updateData } : o
      ))
      // Cập nhật selectedOrder nếu đang xem chi tiết
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, ...updateData }))
      }
    }
    setUpdating(false)
  }

  /**
   * Lấy thông tin chi tiết đơn hàng (bao gồm sản phẩm)
   */
  async function fetchOrderDetails(orderId) {
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        *,
        products:product_id (name, image_url, price)
      `)
      .eq('order_id', orderId)

    if (!error && orderItems) {
      const order = orders.find(o => o.id === orderId)
      setSelectedOrder({ ...order, items: orderItems })
    }
  }

  // === FILTER DATA ===
  const filteredOrders = orders.filter(order => {
    // Lọc theo trạng thái
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const customerName = (order.customer_name || order.profiles?.full_name || '').toLowerCase()
      const phone = (order.phone || '').toLowerCase()
      const orderId = String(order.id)
      
      if (!customerName.includes(search) && !phone.includes(search) && !orderId.includes(search)) {
        return false
      }
    }
    
    return true
  })

  // === HELPER FUNCTIONS ===
  
  /**
   * Lấy màu badge cho trạng thái đơn hàng
   */
  function getStatusBadge(status) {
    const statusMap = {
      pending: { text: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      confirmed: { text: 'Đã xác nhận', class: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      shipping: { text: 'Đang giao', class: 'bg-purple-100 text-purple-700', icon: Truck },
      completed: { text: 'Hoàn thành', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { text: 'Đã hủy', class: 'bg-red-100 text-red-700', icon: XCircle },
    }
    return statusMap[status] || statusMap.pending
  }

  /**
   * Lấy màu badge cho trạng thái thanh toán
   */
  function getPaymentBadge(paymentStatus, paymentMethod) {
    if (paymentStatus === 'paid') {
      return { text: 'Đã thanh toán', class: 'bg-green-100 text-green-700' }
    }
    if (paymentStatus === 'cod_pending') {
      return { text: 'COD - Chờ thu tiền', class: 'bg-orange-100 text-orange-700' }
    }
    if (paymentStatus === 'failed') {
      return { text: 'Thanh toán thất bại', class: 'bg-red-100 text-red-700' }
    }
    return { text: 'Chờ thanh toán', class: 'bg-yellow-100 text-yellow-700' }
  }

  // === RENDER ===
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-orange-600" />
          Quản lý Đơn hàng
        </h2>
        <Button onClick={fetchOrders} variant="outline">
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Tìm kiếm */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên, SĐT, mã đơn..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Lọc theo trạng thái */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="shipping">Đang giao hàng</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Thanh toán</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày đặt</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      Không tìm thấy đơn hàng
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const status = getStatusBadge(order.status)
                    const payment = getPaymentBadge(order.payment_status, order.payment_method)
                    const StatusIcon = status.icon

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium">#{order.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{order.customer_name || order.profiles?.full_name || 'N/A'}</p>
                            <p className="text-sm text-slate-500">{order.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${payment.class}`}>
                              {payment.text}
                            </span>
                            <p className="text-xs text-slate-500 uppercase">
                              {order.payment_method === 'cod' ? 'COD' : 'MoMo'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.class}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Nút xem chi tiết */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => fetchOrderDetails(order.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-6 py-4">
                                    {/* Thông tin khách hàng */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Thông tin khách hàng</h4>
                                      <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                                        <p><strong>Tên:</strong> {selectedOrder.customer_name || selectedOrder.profiles?.full_name}</p>
                                        <p><strong>SĐT:</strong> {selectedOrder.phone}</p>
                                        <p><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}</p>
                                      </div>
                                    </div>

                                    {/* Danh sách sản phẩm */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Sản phẩm</h4>
                                      <div className="border rounded-lg divide-y">
                                        {selectedOrder.items?.map((item, idx) => (
                                          <div key={idx} className="p-3 flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded"></div>
                                            <div className="flex-1">
                                              <p className="font-medium">{item.products?.name || 'Sản phẩm'}</p>
                                              <p className="text-sm text-slate-500">x{item.quantity}</p>
                                            </div>
                                            <p className="font-bold">
                                              {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Thông tin thanh toán */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Thanh toán</h4>
                                      <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                                        <p><strong>Phương thức:</strong> {selectedOrder.payment_method === 'cod' ? 'COD - Thanh toán khi nhận hàng' : 'MoMo'}</p>
                                        <p><strong>Trạng thái:</strong> 
                                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentBadge(selectedOrder.payment_status).class}`}>
                                            {getPaymentBadge(selectedOrder.payment_status).text}
                                          </span>
                                        </p>
                                        <p className="text-lg font-bold text-primary pt-2">
                                          Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.total_amount)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Cập nhật trạng thái */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Cập nhật trạng thái</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {['pending', 'confirmed', 'shipping', 'completed', 'cancelled'].map((st) => {
                                          const statusInfo = getStatusBadge(st)
                                          const StatusIcon = statusInfo.icon
                                          const isActive = selectedOrder.status === st
                                          return (
                                            <Button
                                              key={st}
                                              variant={isActive ? 'default' : 'outline'}
                                              size="sm"
                                              disabled={updating || isActive}
                                              onClick={() => updateOrderStatus(selectedOrder.id, st)}
                                              className={isActive ? '' : statusInfo.class.replace('bg-', 'border-').replace('100', '300')}
                                            >
                                              <StatusIcon className="w-4 h-4 mr-1" />
                                              {statusInfo.text}
                                            </Button>
                                          )
                                        })}
                                      </div>
                                      {selectedOrder.payment_method === 'cod' && selectedOrder.payment_status !== 'paid' && (
                                        <p className="text-sm text-orange-600 mt-2">
                                          * Khi chuyển sang "Hoàn thành", đơn hàng COD sẽ được đánh dấu là đã thanh toán.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Quick actions - Cập nhật trạng thái nhanh */}
                            {order.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200"
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                disabled={updating}
                              >
                                Xác nhận
                              </Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-purple-600 border-purple-200"
                                onClick={() => updateOrderStatus(order.id, 'shipping')}
                                disabled={updating}
                              >
                                Giao hàng
                              </Button>
                            )}
                            {order.status === 'shipping' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                disabled={updating}
                              >
                                Hoàn thành
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistics summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['pending', 'confirmed', 'shipping', 'completed', 'cancelled'].map((st) => {
          const statusInfo = getStatusBadge(st)
          const count = orders.filter(o => o.status === st).length
          const StatusIcon = statusInfo.icon
          return (
            <Card key={st} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(st)}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${statusInfo.class}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-slate-500">{statusInfo.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
