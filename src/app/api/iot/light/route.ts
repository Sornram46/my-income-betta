import { NextResponse } from 'next/server'
import mqtt from 'mqtt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let client: mqtt.MqttClient | null = null
  try {
    const { cmd } = await req.json()
    if (!['on', 'off'].includes(cmd)) {
      return NextResponse.json({ ok: false, msg: 'cmd invalid' }, { status: 400 })
    }

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
    const topic = process.env.MQTT_TOPIC_SET || 'smartbetta/esp32-01/set'
    console.log('Publishing MQTT:', { url: process.env.MQTT_URL, topic, payload: (cmd as string).toUpperCase() })

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('mqtt-timeout'))
      }, 5000)

      const cleanup = () => {
        clearTimeout(timer)
        client?.removeAllListeners('connect')
        client?.removeAllListeners('error')
      }

      client!.once('connect', () => {
        client!.publish(topic, (cmd as string).toUpperCase(), { qos: 1 }, (err) => {
          if (err) {
            cleanup()
            reject(err)
          } else {
            cleanup()
            resolve()
          }
        })
      })

      client!.once('error', (err) => {
        cleanup()
        reject(err)
      })
    })

    return NextResponse.json({ ok: true, cmd })
  } catch (e: any) {
    console.error('iot/light error:', e)
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 })
  } finally {
    // ปิดการเชื่อมต่อเสมอ เพื่อไม่ให้ socket ค้าง
    client?.end(true)
  }
}
