"use client"

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

export default function AdminProductsPage() {
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
    category_id: '',
    is_featured: false
  })

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/')
      return
    }

    if (user && profile?.role === 'admin') {
      fetchData()
    }
  }, [user, profile, authLoading, router])

  async function fetchData() {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('type', 'product')
    ])
    if (productsRes.data) setProducts(productsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    setLoading(false)
  }

  function generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function resetForm() {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      original_price: '',
      stock_quantity: '',
      image_url: '',
      category_id: '',
      is_featured: false
    })
    setEditingProduct(null)
  }

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
      category_id: product.category_id?.toString() || '',
      is_featured: product.is_featured
    })
    setIsDialogOpen(true)
  }

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
      is_featured: formData.is_featured
    }

    if (editingProduct) {
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

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    
    if (error) {
      toast.error('Không thể xóa sản phẩm')
    } else {
      toast.success('Xóa sản phẩm thành công')
      setProducts(products.filter(p => p.id !== id))
    }
  }

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <Label htmlFor="is_featured">Sản phẩm nổi bật</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Sản phẩm</th>
                    <th className="text-left p-4">Giá</th>
                    <th className="text-left p-4">Kho</th>
                    <th className="text-left p-4">Danh mục</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                            <Image
                              src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-primary font-medium">
                        {product.price.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-4">{product.stock_quantity}</td>
                      <td className="p-4">
                        {categories.find(c => c.id === product.category_id)?.name || '-'}
                      </td>
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
