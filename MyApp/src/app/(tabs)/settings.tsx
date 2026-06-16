import { StyleSheet, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function SettingsScreen() {

    return(
        <SafeAreaProvider>
            <View style={styles.safeArea}>
                <Text style={styles.text}>Настройки</Text>
            </View>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        padding: 15,
        flex: 1, 
        backgroundColor: '#fff',
        marginTop: 0,
    },
    text: { textAlign: 'center', }
})