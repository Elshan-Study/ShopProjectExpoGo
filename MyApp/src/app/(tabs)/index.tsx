import { useFocusEffect, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, TextInput, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface Product {
  id: number,
  name: string,
  price: number,
  category: string,
  description: string
}

interface ItemProps {
  item: Product,
  deleteItem: (id: number) => void
  selectHandle: (id: number) => void
  editItem: (id: number) => void
  isSelected: boolean
}

function Item({ item, deleteItem, selectHandle, editItem, isSelected }: ItemProps) {
  return (
    <View className="rounded-xl border border-blue-300 bg-blue-50 w-[47%] p-3 gap-2">
      <Text className="text-blue-900 font-semibold text-center">{item.name}</Text>
      <Text className="text-blue-700 text-xs text-center">{item.category}</Text>
      <Text className="text-blue-600 text-xs text-center" numberOfLines={2}>{item.description}</Text>
      <Text className="text-blue-800 font-bold text-center">${item.price}</Text>

      <Pressable
        onPress={() => editItem(item.id)}
        className="bg-blue-500 rounded-lg py-1.5 items-center"
      >
        <Text className="text-white font-medium text-sm">Edit</Text>
      </Pressable>

      <Pressable
        onPress={() => selectHandle(item.id)}
        className={`rounded-lg py-1.5 items-center ${isSelected ? 'bg-red-500' : 'bg-blue-300'}`}
      >
        <Text className="text-white font-medium text-sm">{isSelected ? 'Deselect' : 'Select'}</Text>
      </Pressable>

      <Pressable
        onPress={() => deleteItem(item.id)}
        className="bg-red-400 rounded-lg py-1.5 items-center"
      >
        <Text className="text-white font-medium text-sm">Delete</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();

  const CATEGORIES = [...new Set(products.map(item => item.category))];

  function editItem(id: number) {
    router.push({ pathname: '/product/form', params: { mode: 'edit', id } });
  }

  async function fetchData() {
    try {
      const res = await fetch('http://192.168.183.2:5000/products');
      const data = await res.json();
      setProducts(data.success ? data.products : []);
    } catch (error) {
      console.error("Ошибка сети:", error);
      setProducts([]);
    }
  }

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const filteredProducts = products.filter(item =>
    item.category.toLowerCase().includes(selectedCategory.toLowerCase()) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function deleteItem(id: number) {
    try {
      const res = await fetch(`http://192.168.183.2:5000/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(arr => arr.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  }

  async function deleteAll() {
    try {
      const res = await fetch('http://192.168.183.2:5000/products/bulk', {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProducts })
      });
      const data = await res.json();
      if (data.success) {
        const deletedIds = data.deletedProducts.map((item: Product) => item.id);
        setProducts(arr => arr.filter(item => !deletedIds.includes(item.id)));
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  }

  function selectHandle(id: number) {
    const isSelected = selectedProducts.includes(id);
    setSelectedProducts(arr => isSelected ? arr.filter(item => item !== id) : [...arr, id]);
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-blue-500 px-4" style={{ marginTop: StatusBar.currentHeight || 0 }}>

        {/* Header actions */}
        <View className="flex-row gap-3 py-3">
          <Pressable
            onPress={() => router.push({ pathname: '/product/form', params: { mode: 'create' } })}
            className="flex-1 bg-white rounded-xl py-2.5 items-center"
          >
            <Text className="text-blue-500 font-semibold">+ Add Product</Text>
          </Pressable>
          <Pressable
            onPress={deleteAll}
            className="flex-1 bg-red-500 rounded-xl py-2.5 items-center"
          >
            <Text className="text-white font-semibold">Delete Selected</Text>
          </Pressable>
        </View>

        {/* Search */}
        <TextInput
          className="bg-white rounded-xl px-4 py-2.5 mb-3 text-blue-900"
          placeholder="Search..."
          placeholderTextColor="#93c5fd"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4, alignItems: 'center' }}
          style={{ marginBottom: 12, flexShrink: 0 }}
        >
          {CATEGORIES.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedCategory(selectedCategory === item ? "" : item)}
              className={`px-4 py-1.5 rounded-full ${selectedCategory === item ? 'bg-white' : 'bg-blue-400'}`}
            >
              <Text className={`font-medium text-sm ${selectedCategory === item ? 'text-blue-500' : 'text-white'}`}>
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Product grid */}
        <FlatList
          data={filteredProducts}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Item
              item={item}
              deleteItem={deleteItem}
              selectHandle={selectHandle}
              editItem={editItem}
              isSelected={selectedProducts.includes(item.id)}
            />
          )}
        />
      </View>
    </SafeAreaProvider>
  );
}