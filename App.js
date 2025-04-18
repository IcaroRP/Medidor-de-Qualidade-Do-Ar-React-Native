import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [airQuality, setAirQuality] = useState(50);
  const [data, setData] = useState([50, 60, 55]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAQI = Math.floor(Math.random() * 200);
      setAirQuality(newAQI);
      setData((prev) => [...prev.slice(-9), newAQI]); // últimos 10 pontos
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌫️ Qualidade do Ar</Text>
      <Text style={[styles.status, { color: airQuality > 100 ? 'red' : 'green' }]}>
        {airQuality > 100 ? 'Ruim' : 'Boa'} - AQI: {airQuality}
      </Text>

      <LineChart
        data={{
          labels: data.map((_, i) => `${i + 1}`),
          datasets: [{ data }],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#4f46e5',
          backgroundGradientTo: '#9333ea',
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: () => '#fff',
        }}
        style={styles.chart}
        bezier
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1e1b4b',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  chart: {
    borderRadius: 16,
  },
});
