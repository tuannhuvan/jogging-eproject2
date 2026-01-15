"use client"

/**
 * ADMIN PRODUCTS PAGE - Trang quản lý sản phẩm
 * 
 * Trang này cho phép admin:
 * - Xem danh sách tất cả sản phẩm
 * - Thêm sản phẩm mới
 * - Chỉnh sửa thông tin sản phẩm
 * - Xóa sản phẩm
 * 
 * Dữ liệu được lưu trữ trong bảng 'products' của Supabase
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
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

/**
 * Component trang quản lý sản phẩm
 * Hiển thị bảng danh sách và form thêm/sửa sản phẩm
 */
export default function AdminProductsPage() {
  const router = useRouter()
  // Lấy thông tin user và profile từ AuthContext
  const { user, profile, loading: authLoading } = useAuth()
  // State lưu danh sách sản phẩm
  const [products, setProducts] = useState([])
  // State lưu danh sách danh mục sản phẩm
  const [categories, setCategories] = useState([])
  // State theo dõi trạng thái đang tải
  const [loading, setLoading] = useState(true)
  // State quản lý trạng thái mở/đóng dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // State lưu sản phẩm đang được chỉnh sửa (null nếu đang thêm mới)
  const [editingProduct, setEditingProduct] = useState(null)
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    name: '',           // Tên sản phẩm
    slug: '',           // Đường dẫn URL
    description: '',    // Mô tả sản phẩm
    price: '',          // Giá bán
    original_price: '', // Giá gốc (nếu có giảm giá)
    stock_quantity: '', // Số lượng trong kho
    image_url: '',      // URL hình ảnh chính
    images: [],         // Danh sách URL hình ảnh phụ
    category_id: '',    // ID danh mục
    is_featured: false  // Có phải sản phẩm nổi bật không
  })
  const [newImageUrl, setNewImageUrl] = useState('') // URL ảnh mới đang nhập
  const [uploadingImage, setUploadingImage] = useState(false)

  // Effect: Kiểm tra quyền admin và tải dữ liệu
  useEffect(() => {
    // Chuyển hướng nếu không phải admin
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/')
      return
    }

    // Nếu là admin, tải dữ liệu sản phẩm và danh mục
    if (user && profile?.role === 'admin') {
      fetchData()
    }
  }, [user, profile, authLoading, router])

  /**
   * Hàm tải dữ liệu sản phẩm và danh mục từ Supabase
   */
  async function fetchData() {
    // Gọi song song 2 API để tối ưu thời gian tải
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('type', 'product')
    ])
    if (productsRes.data) setProducts(productsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    setLoading(false)
  }

  /**
   * Hàm tạo slug từ tên sản phẩm
   * Chuyển tiếng Việt có dấu thành không dấu, thay khoảng trắng bằng dấu gạch ngang
   * @param {string} name - Tên sản phẩm
   * @returns {string} Slug đã được chuẩn hóa
   */
  function generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')                    // Tách dấu khỏi ký tự
      .replace(/[\u0300-\u036f]/g, '')     // Xóa các dấu
      .replace(/đ/g, 'd')                  // Chuyển đ thành d
      .replace(/[^a-z0-9]+/g, '-')         // Thay ký tự đặc biệt bằng -
      .replace(/(^-|-$)/g, '')             // Xóa - ở đầu và cuối
  }

  /**
   * Hàm reset form về trạng thái ban đầu
   */
  function resetForm() {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      original_price: '',
      stock_quantity: '',
      image_url: '',
      images: [],
      category_id: '',
      is_featured: false
    })
    setEditingProduct(null)
    setNewImageUrl('')
  }

  /**
   * Hàm mở dialog chỉnh sửa với dữ liệu sản phẩm đã chọn
   * @param {Object} product - Sản phẩm cần chỉnh sửa
   */
  function openEditDialog(product) {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toLocaleString('vi-VN'),
      original_price: product.original_price?.toLocaleString('vi-VN') || '',
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || '',
      images: product.images || [],
      category_id: product.category_id?.toString() || '',
      is_featured: product.is_featured
    })
    setNewImageUrl('')
    setIsDialogOpen(true)
  }

  function addImage() {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] })
      setNewImageUrl('')
    }
  }

  function removeImage(index) {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })
  }

  async function handleImageUpload(e) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    const uploadedUrls = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)
        uploadedUrls.push(publicUrl)
      }
    }

    if (uploadedUrls.length > 0) {
      if (!formData.image_url) {
        setFormData({ 
          ...formData, 
          image_url: uploadedUrls[0],
          images: [...formData.images, ...uploadedUrls.slice(1)]
        })
      } else {
        setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] })
      }
      toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`)
    }
    setUploadingImage(false)
  }

  /**
   * Hàm xử lý submit form (thêm mới hoặc cập nhật)
   * @param {Event} e - Sự kiện submit form
   */
  async function handleSubmit(e) {
    e.preventDefault()
    
    // Chuẩn bị dữ liệu để lưu vào database
    const productData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description,
      price: parseFloat(formData.price.replace(/[.,]/g, '')),           // Chuyển giá từ string sang number
      original_price: formData.original_price ? parseFloat(formData.original_price.replace(/[.,]/g, '')) : null,
      stock_quantity: parseInt(formData.stock_quantity),
      image_url: formData.image_url,
      images: formData.images,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      is_featured: formData.is_featured
    }

    if (editingProduct) {
      // Cập nhật sản phẩm đã có
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)
      
      if (error) {
        toast.error('Không thể cập nhật sản phẩm')
      } else {
        toast.success('Cập nhật sản phẩm thành công')
        fetchData()
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      // Thêm sản phẩm mới
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

  /**
   * Hàm xử lý xóa sản phẩm
   * @param {number} id - ID của sản phẩm cần xóa
   */
  async function handleDelete(id) {
    // Hiển thị confirm trước khi xóa
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    
    if (error) {
      toast.error('Không thể xóa sản phẩm')
    } else {
      toast.success('Xóa sản phẩm thành công')
      // Cập nhật state để loại bỏ sản phẩm đã xóa
      setProducts(products.filter(p => p.id !== id))
    }
  }

  /**
   * Hàm lấy URL hình ảnh hợp lệ và làm sạch tiền tố 'o-' nếu có
   * @param {string} url - URL hình ảnh
   * @returns {string} URL hợp lệ hoặc placeholder
   */
  function getImageUrl(url) {
    if (!url || typeof url !== 'string') return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'
    
    let cleanUrl = url;
    
    // Nếu URL bắt đầu bằng 'o-', thử tìm phần URL thực sự bên trong
    if (url.startsWith('o-')) {
      const httpIndex = url.indexOf('http');
      const dataIndex = url.indexOf('data:');
      
      let startIndex = -1;
      if (httpIndex !== -1 && dataIndex !== -1) {
        startIndex = Math.min(httpIndex, dataIndex);
      } else {
        startIndex = Math.max(httpIndex, dataIndex);
      }
      
      if (startIndex !== -1) {
        cleanUrl = url.substring(startIndex);
      }
    }

    // Kiểm tra xem URL có hợp lệ không (phải bắt đầu bằng http, /, hoặc data:)
    if (cleanUrl.startsWith('http') || cleanUrl.startsWith('/') || cleanUrl.startsWith('data:')) {
      return cleanUrl
    }
    
    // Nếu vẫn không hợp lệ, trả về placeholder
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'
  }

  // Hiển thị skeleton loading khi đang tải
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

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header: Nút quay lại, tiêu đề và nút thêm mới */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
          </div>
          
          {/* Dialog thêm/sửa sản phẩm */}
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
              {/* Form thêm/sửa sản phẩm */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Hàng 1: Tên và Slug */}
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
                {/* Mô tả sản phẩm */}
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                {/* Hàng 3: Giá bán, Giá gốc, Số lượng */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Giá bán (VNĐ)</Label>
                    <Input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá gốc (VNĐ)</Label>
                    <Input
                      type="text"
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
                {/* Hàng 4: Danh mục và URL hình ảnh chính */}
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
                    <Label>URL hình ảnh chính</Label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                {/* Upload nhiều ảnh */}
                <div className="space-y-2">
                  <Label>Tải ảnh lên (chọn nhiều ảnh)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <p className="text-sm text-muted-foreground">Đang tải lên...</p>}
                </div>
                {/* Thêm URL ảnh phụ */}
                <div className="space-y-2">
                  <Label>Thêm URL ảnh phụ</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Nhập URL ảnh"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    />
                    <Button type="button" variant="outline" onClick={addImage}>Thêm</Button>
                  </div>
                </div>
                {/* Hiển thị danh sách ảnh đã thêm */}
                {(formData.image_url || formData.images.length > 0) && (
                  <div className="space-y-2">
                    <Label>Ảnh đã chọn ({1 + formData.images.length} ảnh)</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.image_url && (
                        <div className="relative group">
                          <img
                            src={formData.image_url}
                            alt="Ảnh chính"
                            className="w-20 h-20 object-cover rounded border-2 border-primary"
                          />
                          <span className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs text-center">Chính</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_url: formData.images[0] || '', images: formData.images.slice(1) })}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition"
                          >×</button>
                        </div>
                      )}
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Ảnh ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded border cursor-pointer hover:border-primary"
                            onClick={() => {
                              const newImages = [...formData.images]
                              newImages.splice(idx, 1)
                              if (formData.image_url) newImages.unshift(formData.image_url)
                              setFormData({ ...formData, image_url: img, images: newImages })
                            }}
                            title="Click để đặt làm ảnh chính"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition"
                          >×</button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Click vào ảnh phụ để đặt làm ảnh chính</p>
                  </div>
                )}
                {/* Checkbox sản phẩm nổi bật */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <Label htmlFor="is_featured">Sản phẩm nổi bật</Label>
                </div>
                {/* Nút submit */}
                <Button type="submit" className="w-full">
                  {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bảng danh sách sản phẩm */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header của bảng */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Sản phẩm</th>
                    <th className="text-left p-4">Giá</th>
                    <th className="text-left p-4">Kho</th>
                    <th className="text-left p-4">Danh mục</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                {/* Body của bảng */}
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t">
                      {/* Cột sản phẩm: Hình ảnh và tên */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                              <Image
                                src={getImageUrl(product.image_url)}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      {/* Cột giá */}
                      <td className="p-4 text-primary font-medium">
                        {product.price.toLocaleString('vi-VN')}đ
                      </td>
                      {/* Cột số lượng trong kho */}
                      <td className="p-4">{product.stock_quantity}</td>
                      {/* Cột danh mục */}
                      <td className="p-4">
                        {categories.find(c => c.id === product.category_id)?.name || '-'}
                      </td>
                      {/* Cột thao tác: Sửa và Xóa */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
