'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useReducedMotion, type Variants } from 'framer-motion'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

type BoxProps = { children: ReactNode; className?: string }

/** Container: children wrapped in <Item> appear one after another. */
export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.08,
}: BoxProps & { delay?: number; stagger?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  )
}

export function Item({ children, className }: BoxProps) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  )
}

/** Fades in when scrolled into view. */
export function Reveal({ children, className, delay = 0 }: BoxProps & { delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

/** Counts up to `value` and formats it as a Thai locale number. */
export function AnimatedNumber({
  value,
  decimals = 2,
  className,
}: {
  value: number
  decimals?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const previous = useRef(0)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      previous.current = value
      return
    }
    const controls = animate(previous.current, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (latest) => {
        previous.current = latest
        setDisplay(latest)
      },
    })
    return () => controls.stop()
  }, [value, reduce])

  return (
    <span className={className}>
      {display.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  )
}
