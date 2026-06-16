
import { useFocusEffect, useRouter } from 'expo-router';
import { useState, useCallback} from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar, Button, TextInput } from 'react-native';
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
}

function Item({ item, deleteItem, selectHandle, editItem }: ItemProps) {
  const [isSelect, setSelect] = useState(false);

  return (
    <View style={styles.itemBox}>
      <Text style={styles.text}>{item.id}</Text>
      <Text style={styles.text}>{item.name}</Text>
      <Text style={styles.text}>{item.description}</Text>
      <Text style={styles.text}>{item.category}</Text>
      <Text style={styles.text}>{item.price}</Text>
      <Button
        onPress={() => deleteItem(item.id)}
        title="DELETE"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
      <Button
        onPress={() => {
          setSelect((flag) => !flag)
          selectHandle(item.id)
        }}

        title="SELECT FOR DELETING"
        color={isSelect ? 'red' : 'green'}
        accessibilityLabel="Learn more about this purple button"
      />
      <Button
        onPress={() => editItem(item.id)}
        title="EDIT"
        color="#128822"
      />
    </View>
  )
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery , setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedCategory , setSelectedCategory] = useState("");
  const router = useRouter();

  const CATEGORIES = [...new Set(products.map(item => item.category))]

  function editItem(id: number) {
  router.push({
  pathname: '/product/form',
  params: { mode: 'edit', id: id }
})
}

  async function fetchData() {
      try {
        const res = await fetch('http://192.168.183.2:5000/products');
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Ошибка сети:", error);
        setProducts([]);
      }
    }

  useFocusEffect(
    useCallback(() => {
      fetchData()  
    }, [])
  );
    
  const filteredProducts = products.filter((item) =>
  item.category.toLowerCase().includes(selectedCategory.toLowerCase()) &&
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
)

  async function deleteItem(id: number) {
    try {
      const res = await fetch('http://192.168.183.2:5000/products/' + id,
        { method: 'DELETE' }
      );
      const data = await res.json();

      if (data.success) {
        setProducts((arr) => {
          let i = arr.findIndex((item) => item.id === id)
          let filteredProducts = [...arr]
          filteredProducts.splice(i, 1)
          return filteredProducts
        });
      } else {
        console.log(data)
      }

    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  }

  async function deleteAll() {
    try {
      const res = await fetch('http://192.168.183.2:5000/products/bulk',
        {
          method: 'DELETE',
          headers: {
            "Content-type": 'application/json'
          },
          body: JSON.stringify({ ids: selectedProducts })
        }
      );
      const data = await res.json();

      if (data.success) {
        let deletedIds = data.deletedProducts.map((item: Product) => item.id)
        setProducts((arr) => {
          let filteredProducts = arr.filter((item) => !deletedIds.includes(item.id))
          return filteredProducts
        });
        console.log(data)
      } else {
        console.log(data)
      }

    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  }

  function selectHandle(id: number) {
  const isSelected = selectedProducts.includes(id);
  if (isSelected) {
    setSelectedProducts((arr) => arr.filter((item) => item !== id));
  } else {
    setSelectedProducts((arr) => [...arr, id]);
  }
}

  return (
    <SafeAreaProvider>
      <View style={styles.safeArea}>
        <Button
          onPress={deleteAll}
          title="DELETE ALL"
          color={'red'}
          accessibilityLabel="Learn more about this purple button"
        />
        <Button
          onPress={() => router.push({
            pathname: '/product/form',
            params: { mode: 'create' }
          })}
          title="Add Product"
          color={'green'}
          accessibilityLabel="Learn more about this purple button"
        />
        <FlatList
          data={CATEGORIES}
          horizontal  // ← горизонтальный скролл
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Button
              title={item}
              onPress={() => setSelectedCategory(selectedCategory === item ? "" : item)}
              color={selectedCategory === item ? 'blue' : 'grey'}
            />
          )}
/>
        <TextInput
          onChangeText={( text: string) => setSearchQuery(text)}
          value={searchQuery}
        />
        <FlatList
          data={filteredProducts}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => <Item item={item} deleteItem={deleteItem} selectHandle={selectHandle} editItem={editItem} />}
          keyExtractor={item => item.id.toString()}
          // Этот стиль отвечает за центрирование контента внутри списка:
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    padding: 15,
    flex: 1, // Занимает всю доступную высоту экрана
    backgroundColor: '#fff',
    marginTop: StatusBar.currentHeight || 0,

  },
  listContent: {
    flexGrow: 1,            // Позволяет контейнеру растянуться на весь экран
    justifyContent: 'space-between', // Центрирует элементы по вертикали
    alignItems: 'center',     // Центрирует элементы по горизонтали
    paddingVertical: 20,
    gap: 30,
  },
  itemBox: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: "45%",
    justifyContent: 'center',
    gap: 20,
    // Элементы списка будут занимать 90% ширины экрана
  },
  text: {
    textAlign: 'center', // Текст внутри карточки тоже будет по центру
  }
});
