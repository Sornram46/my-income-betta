import { NextResponse } from 'next/server'
import mqtt from 'mqtt'

export async function GET() {
  let client: mqtt.MqttClient | null = null
  try {
    if (!process.env.MQTT_URL) {
      return NextResponse.json({ ok: false, error: 'MQTT_URL missing' }, { status: 500 })
    }

    client = mqtt.connect(process.env.MQTT_URL, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
      rejectUnauthorized: true,
      reconnectPeriod: 0,
      keepalive: 30,
    })

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000)
      const cleanup = () => clearTimeout(timer)

      client!.once('connect', () => { cleanup(); resolve() })
      client!.once('error', (err) => { cleanup(); reject(err) })
    })

    await new Promise<void>((resolve, reject) => {
      client!.publish(process.env.MQTT_TOPIC_STATE || 'test/health', 'health-ok', { qos: 0 }, (err) => {
        if (err) reject(err); else resolve()
      })
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('mqtt-health error:', e)
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 })
  } finally {
    client?.end(true)
  }
}