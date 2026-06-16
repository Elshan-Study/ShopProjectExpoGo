import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Pressable, TextInput, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

export default function ProductFormScreen() {
  const { mode, id } = useLocalSearchParams();
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (mode === 'edit') {
      async function fetchProduct() {
        const res = await fetch(`http://192.168.183.2:5000/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProductName(data.product.name);
          setPrice(String(data.product.price));
          setCategory(data.product.category);
          setDescription(data.product.description);
        }
      }
      fetchProduct();
    }
  }, []);

  async function submitChange() {
    const url = mode === "create"
      ? "http://192.168.183.2:5000/products"
      : `http://192.168.183.2:5000/products/${id}`;

    try {
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName, price: Number(price), category, description })
      });
      const data = await res.json();
      if (data.success) router.back();
    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  }

  return (
    <ScrollView className="flex-1 bg-blue-500" contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text className="text-white text-2xl font-bold mb-2">
        {mode === 'create' ? 'New Product' : 'Edit Product'}
      </Text>

      {[
        { placeholder: "Name", value: productName, onChange: setProductName },
        { placeholder: "Price", value: price, onChange: setPrice, numeric: true },
        { placeholder: "Category", value: category, onChange: setCategory },
        { placeholder: "Description", value: description, onChange: setDescription },
      ].map(({ placeholder, value, onChange, numeric }) => (
        <TextInput
          key={placeholder}
          className="bg-white rounded-xl px-4 py-3 text-blue-900"
          placeholder={placeholder}
          placeholderTextColor="#93c5fd"
          onChangeText={onChange}
          value={value}
          keyboardType={numeric ? 'numeric' : 'default'}
        />
      ))}

      <Pressable
        onPress={submitChange}
        className="bg-white rounded-xl py-3 items-center mt-2"
      >
        <Text className="text-blue-500 font-bold text-base">
          {mode === 'create' ? 'Create' : 'Save Changes'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}