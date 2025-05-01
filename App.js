import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Client } from 'paho-mqtt';

const screenWidth = Dimensions.get('window').width;

// Rótulos CONAMA PM₂.₅ para IQ ∈ [0, 160]
function qualityLabel(iq) {
  if (iq <= 25)   return 'Ótimo';
  if (iq <= 50)   return 'Bom';
  if (iq <= 75)   return 'Moderado';
  if (iq <= 100)  return 'Ruim';
                   return 'Péssimo';
}

// Cores para cada faixa
function qualityColor(iq) {
  if (iq <= 25)   return '#2ecc71'; // verde
  if (iq <= 50)   return '#27ae60'; // verde escuro
  if (iq <= 75)   return '#f1c40f'; // amarelo
  if (iq <= 100)  return '#e67e22'; // laranja
                   return '#c0392b'; // vermelho
}

export default function App() {
  const [airQuality, setAirQuality] = useState(80);
  const [data, setData] = useState([80, 80, 80, 80, 80, 80, 80, 80, 80, 80]);

  useEffect(() => {
    // Conectar no HiveMQ via WebSocket
    const clientID = 'react-native-' + Math.random().toString(16).substr(2, 8);
    const client = new Client('broker.hivemq.com', 8000, clientID);

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log('MQTT Connection lost:', responseObject.errorMessage);
      }
    };

    client.onMessageArrived = (message) => {
      const newIQ = parseInt(message.payloadString, 10);
      if (!isNaN(newIQ)) {
        setAirQuality(newIQ);
        setData(prev => [...prev.slice(-9), newIQ]);
      }
    };

    client.connect({
      onSuccess: () => {
        console.log('Conectado ao HiveMQ');
        client.subscribe('sensor/qualidade_ar');
      },
      useSSL: false,
      onFailure: (err) => console.log('Erro de conexão MQTT:', err)
    });

    return () => client.disconnect();
  }, []);

  const label = qualityLabel(airQuality);
  const color = qualityColor(airQuality);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌫️ Qualidade do Ar</Text>
      <Text style={[styles.status, { color }]}>
        {label} — PM₂.₅: {airQuality} / 160
      </Text>

      <LineChart
        data={{
          labels: data.map((_, i) => `${i + 1}`),
          datasets: [{ data }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix=""
        yAxisInterval={20}
        chartConfig={{
          backgroundGradientFrom: '#4f46e5',
          backgroundGradientTo: '#9333ea',
          decimalPlaces: 0,
          color: () => '#fff',
          labelColor: () => '#fff',
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#fff'
          }
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  chart: {
    borderRadius: 16,
  },
});
