import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Client } from 'paho-mqtt';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const screenWidth = Dimensions.get('window').width;
const MAX_IQ = 160;

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
  if (iq <= 25)   return '#2ecc71';
  if (iq <= 50)   return '#27ae60';
  if (iq <= 75)   return '#f1c40f';
  if (iq <= 100)  return '#e67e22';
  return '#c0392b';
}

// Dicas de saúde e recomendações baseadas na qualidade do ar
function getHealthTips(iq) {
  if (iq <= 50) {
    return [
      '🌿 Ar limpo hoje! Aproveite atividades ao ar livre.',
      '💪 Bom dia para exercícios fora de casa.'
    ];
  }
  if (iq <= 100) {
    return [
      '⚠️ Nível moderado – pessoas sensíveis devem reduzir atividades intensas.',
      '😷 Considere usar uma máscara leve se for se exercitar.'
    ];
  }
  return [
    '❌ Ar de má qualidade – evite exercícios ao ar livre.',
    '🏠 Mantenha portas e janelas fechadas.',
    '🛡️ Use purificador de ar se disponível.',
    '👩‍⚕️ Pessoas com problemas respiratórios: consulte um médico se sentir desconforto.'
  ];
}

// Componente para exibir as dicas de saúde
function HealthTips({ iq, color }) {
  const tips = getHealthTips(iq);
  return (
    <View style={[styles.tipsContainer, { borderLeftColor: color }]}>  
      <Text style={[styles.tipsTitle, { color }]}>Dicas de Saúde</Text>
      {tips.map((tip, idx) => (
        <Text key={idx} style={[styles.tipText, { color }]}>{tip}</Text>
      ))}
    </View>
  );
}

// Componente de status de conexão MQTT
function ConnectionIndicator({ status }) {
  const statusColors = {
    connecting: '#f39c12', // laranja
    connected: '#2ecc71',  // verde
    disconnected: '#c0392b' // vermelho
  };
  const statusLabels = {
    connecting: 'Conectando...',
    connected: 'Conectado',
    disconnected: 'Desconectado'
  };
  return (
    <View style={styles.connContainer}>
      <View style={[styles.connDot, { backgroundColor: statusColors[status] }]} />
      <Text style={styles.connText}>{statusLabels[status]}</Text>
    </View>
  );
}

export default function App() {
  const [airQuality, setAirQuality] = useState(80);
  const [data, setData] = useState(Array(10).fill(80));
  const [connStatus, setConnStatus] = useState('connecting');

  useEffect(() => {
    const clientID = 'react-native-' + Math.random().toString(16).substr(2, 8);
    const client = new Client('broker.hivemq.com', 8000, clientID);

    setConnStatus('connecting');
    client.onConnectionLost = responseObject => {
      setConnStatus('disconnected');
    };
    client.onMessageArrived = message => {
      const newIQ = parseInt(message.payloadString, 10);
      if (!isNaN(newIQ)) {
        setAirQuality(newIQ);
        setData(prev => [...prev.slice(-9), newIQ]);
      }
    };
    client.connect({
      onSuccess: () => {
        setConnStatus('connected');
        client.subscribe('sensor/qualidade_ar');
      },
      useSSL: false,
      onFailure: () => setConnStatus('disconnected')
    });

    return () => {
      client.disconnect();
      setConnStatus('disconnected');
    };
  }, []);

  const label = qualityLabel(airQuality);
  const color = qualityColor(airQuality);
  const fill = Math.min((airQuality / MAX_IQ) * 100, 100);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌫️ Qualidade do Ar</Text>

      {/* Indicador de conexão MQTT */}
      <ConnectionIndicator status={connStatus} />

      <AnimatedCircularProgress
        size={180}
        width={15}
        fill={fill}
        tintColor={color}
        backgroundColor="#444"
        rotation={0}
      >
        {() => (
          <View style={styles.progressContent}>
            <Text style={styles.progressValue}>{airQuality}</Text>
            <Text style={styles.progressLabel}>{label}</Text>
          </View>
        )}
      </AnimatedCircularProgress>

      <Text style={[styles.status, { color }]}>  
        {label} — PM₂.₅: {airQuality} / {MAX_IQ}
      </Text>

      {/* Dicas de Saúde */}
      <HealthTips iq={airQuality} color={color} />

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
            stroke: '#fff',
          },
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
  connContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  connDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connText: {
    fontSize: 14,
    color: '#fff',
  },
  status: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 24,
  },
  chart: {
    borderRadius: 16,
  },
  progressContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 16,
    color: '#fff',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#2c2a72',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 6,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
});
