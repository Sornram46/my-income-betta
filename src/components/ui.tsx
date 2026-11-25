'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertIcon, CheckCircleIcon } from './icons'

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100'

export const labelCls = 'mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700'

export const primaryBtnCls =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60'

/** Standard page width and spacing. */
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 ${className}`}>{children}</div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(15_23_42/0.06)] ring-1 ring-slate-100 sm:p-6 ${className}`}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 sm:text-base">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function Alert({ type, children }: { type: 'error' | 'success'; children: ReactNode }) {
  const isError = type === 'error'
  return (
    <motion.div
      role={isError ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className="overflow-hidden"
    >
      <div
        className={`mb-4 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
          isError ? 'bg-red-50 text-red-700 ring-1 ring-red-100' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
        }`}
      >
        {isError ? <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />}
        <span>{children}</span>
      </div>
    </motion.div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-slate-500">
      {children}
    </div>
  )
}
