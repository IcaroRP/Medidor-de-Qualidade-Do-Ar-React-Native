import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Feather';

const screenWidth = Dimensions.get('window').width;

const App = () => {
  const [airQuality, setAirQuality] = useState(50);
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAQI = Math.floor(Math.random() * 200);
      setAirQuality(newAQI);
      setData((prev) => [...prev.slice(-9), newAQI]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Monitor de Qualidade do Ar</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="cloud" size={30} color="#4f46e5" />
          <Text style={styles.title}>Índice de Qualidade do Ar</Text>
        </View>

        <View style={styles.gaugeContainer}>
          <Text style={styles.gaugeText}>{airQuality}</Text>
        </View>

        <Text style={[styles.status, airQuality > 100 ? styles.bad : styles.good]}>
          {airQuality > 100 ? 'Ruim' : 'Bom'}
        </Text>

        {airQuality > 100 && (
          <View style={styles.alert}>
            <Icon name="alert-circle" size={20} color="red" />
            <Text style={styles.alertText}>Alerta! Qualidade do ar ruim.</Text>
          </View>
        )}

        <Text style={styles.graphTitle}>Histórico</Text>

        <LineChart
          data={{
            labels: data.map((_, i) => (i + 1).toString()),
            datasets: [{ data }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#eef2ff',
            backgroundGradientTo: '#c7d2fe',
            decimalPlaces: 0,
            color: () => `#4f46e5`,
            labelColor: () => '#555',
            style: { borderRadius: 16 },
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    backgroundColor: '#6366f1',
    flex: 1,
  },
  header: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  gaugeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  status: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  good: {
    color: 'green',
  },
  bad: {
    color: 'red',
  },
  alert: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  alertText: {
    marginLeft: 8,
    color: 'red',
  },
  graphTitle: {
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default App;
