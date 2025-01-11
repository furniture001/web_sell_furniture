export interface Product {
    id: number
    name: string
    description: string
    price: number
    stock: number
    category: string
    image_url: string
    created_at: string
  }
  
  export interface User {
    id: string
    email: string
    name: string
    created_at: string
    last_login?: string
  }