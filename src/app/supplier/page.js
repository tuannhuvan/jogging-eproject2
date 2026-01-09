"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, ArrowLeft, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Trang bảng điều khiển nhà cung cấp
export default function SupplierDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    image_url: '',
    category_id: ''
  })

  // Kiểm tra quyền truy cập và tải dữ liệu khi component được gắn kết
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'supplier')) {
      router.push('/')
      return
    }

    // Tải sản phẩm và danh mục nếu là nhà cung cấp
    if (user && profile?.role === 'supplier') {
      fetchData()
    }
  }, [user, profile, authLoading, router])

  // Hàm tải sản phẩm và danh mục từ database
  async function fetchData() {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').eq('supplier_id', user.id).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('type', 'product')
    ])
    if (productsRes.data) setProducts(productsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    setLoading(false)
  }

  // Hàm tạo slug từ tên sản phẩm
  function generateSlug(name) {
    return name
      .toLowerCase() // Chuyển thành chữ thường
      .normalize('NFD') // Chuẩn hóa Unicode
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/đ/g, 'd') // Thay thế đ thành d
      .replace(/[^a-z0-9]+/g, '-') // Thay ký tự không phải chữ/ số thành dấu -
      .replace(/(^-|-$)/g, '') // Loại bỏ dấu - ở đầu và cuối
  }

  // Hàm đặt lại form
  function resetForm() {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      original_price: '',
      stock_quantity: '',
      image_url: '',
      category_id: ''
    })
    setEditingProduct(null)
  }

  // Hàm mở hộp thoại chỉnh sửa sản phẩm
  function openEditDialog(product) {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || '',
      category_id: product.category_id?.toString() || ''
    })
    setIsDialogOpen(true)
  }

  // Hàm xử lý gửi form thêm/ sửa sản phẩm
  async function handleSubmit(e) {
    e.preventDefault()
    
    const productData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock_quantity: parseInt(formData.stock_quantity),
      image_url: formData.image_url,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      supplier_id: user.id
    }

    // Thêm hoặc cập nhật sản phẩm
    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)
        .eq('supplier_id', user.id)
      
      // Xử lý kết quả  
      if (error) {
        toast.error('Không thể cập nhật sản phẩm')
      } else {
        toast.success('Cập nhật sản phẩm thành công')
        fetchData()
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      const { error } = await supabase.from('products').insert(productData)
      
      if (error) {
        toast.error('Không thể thêm sản phẩm')
      } else {
        toast.success('Thêm sản phẩm thành công')
        fetchData()
        setIsDialogOpen(false)
        resetForm()
      }
    }
  }

  // Hàm xử lý xóa sản phẩm
  async function handleDelete(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('supplier_id', user.id)
    
    if (error) {
      toast.error('Không thể xóa sản phẩm')
    } else {
      toast.success('Xóa sản phẩm thành công')
      setProducts(products.filter(p => p.id !== id))
    }
  }

  // Hiển thị trạng thái tải dữ liệu
  if (authLoading || loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  // Hiển thị giao diện bảng điều khiển nhà cung cấp
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Quản lý sản phẩm của tôi</h1>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium">Tổng số sản phẩm</p>
                <p className="text-3xl font-bold text-primary">{products.length}</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm sản phẩm
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tên sản phẩm</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Giá bán (VNĐ)</Label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Giá gốc (VNĐ)</Label>
                        <Input
                          type="number"
                          value={formData.original_price}
                          onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Số lượng</Label>
                        <Input
                          type="number"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Danh mục</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>URL hình ảnh</Label>
                        <Input
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chưa có sản phẩm nào</h2>
            <p className="text-muted-foreground mb-6">Bắt đầu thêm sản phẩm của bạn ngay!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <Image
                    src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-lg font-bold text-primary mb-2">
                    {product.price.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Kho: {product.stock_quantity} sản phẩm
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditDialog(product)}>
                      <Edit className="w-4 h-4" />
                      Sửa
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive gap-1" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
