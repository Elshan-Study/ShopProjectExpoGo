import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Button, TextInput, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

export default function ProductFormScreen() {
  const { mode, id } = useLocalSearchParams();
  const [productName, setProductName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter();

  useEffect(() => {
  if (mode === 'edit') {
    async function fetchProduct() {
      const res = await fetch(`http://192.168.183.2:5000/products/${id}`);
      const data = await res.json();
      
      if (data.success) {
        setProductName(data.product.name)
        setPrice(String(data.product.price)) 
        setCategory(data.product.category)
        setDescription(data.product.description)
      }
    }
    fetchProduct();
  }
}, []);

  async function submitChange() {
    const body = {
        name: productName,
        price: Number(price), 
        category,
        description
    }

     const url = mode === "create" 
    ? "http://192.168.183.2:5000/products" 
    : `http://192.168.183.2:5000/products/${id}`

    const method = mode === "create" ? "POST" : "PUT"

    try{
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })

        const data = await res.json();

        if (data.success) {
            router.back()  
        }
         else {
        console.log(data)
      }
        

    } catch (error) {
      console.error("Ошибка сети:", error);
    }
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <TextInput 
            style={styles.input}
            placeholder="Название"
            onChangeText = {(text: string) => setProductName(text)}
            value = {productName}
        />
        <TextInput 
            style={styles.input}
            placeholder="Цена"
            onChangeText = {(text: string) => setPrice(text)}
            value = {String(price)} 
        />
        <TextInput 
            style={styles.input}
            placeholder="Категория"
            onChangeText = {(text: string) => setCategory(text)}
            value = {category}
        />
        <TextInput 
            style={styles.input}
            placeholder="Описание"
            onChangeText = {(text: string) => setDescription(text)}
            value = {description}
        />

        <Button
          onPress={submitChange}
          title="Submit"
          color={'green'}
        />
    </ScrollView >
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  }
})