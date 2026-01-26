'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo, { LogoIcon } from './Logo'
import {
  HomeIcon,
  HiraganaIcon,
  BookIcon,
  KanjiIcon,
  ChatIcon,
  CloseIcon,
  MenuIcon,
} from './icons'

const navItems = [
  { href: '/', label: '홈', Icon: HomeIcon },
  { href: '/base-study', label: '히라가나/가타카나', Icon: HiraganaIcon },
  { href: '/grammar-study', label: '문법', Icon: BookIcon },
  { href: '/kanji-study', label: '한자', Icon: KanjiIcon },
  { href: '/word-sentence', label: '예문', Icon: ChatIcon },
]

export default function Header() {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // 서랍 열렸을 때 스크롤 방지
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* 햄버거 메뉴 버튼 */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer"
            >
              <MenuIcon isOpen={isDrawerOpen} className="w-6 h-6" />
            </button>

            {/* 로고 */}
            <Link href="/" className="flex items-center cursor-pointer group">
              <Logo size="sm" className="transition-transform duration-300 group-hover:scale-105" />
            </Link>

            {/* 빈 공간 (균형용) */}
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* 오버레이 */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* 서랍 메뉴 */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 서랍 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            onClick={() => setIsDrawerOpen(false)}
            className="cursor-pointer"
            style={{ animation: isDrawerOpen ? 'bounceIn 0.5s ease-out' : 'none' }}
          >
            <Logo size="sm" />
          </Link>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:rotate-90 transition-all duration-300 active:scale-90 cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="p-4">
          <div className="flex flex-col gap-2">
            {navItems.map((item, index) => {
              const Icon = item.Icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  style={{
                    animation: isDrawerOpen ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
                  }}
                >
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-white/20 dark:bg-zinc-900/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 group-hover:scale-110'
                  }`}>
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${
                      active ? '' : 'group-hover:scale-110'
                    }`} />
                  </span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 서랍 하단 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-2">
            <LogoIcon size={16} />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              MANABU LABS v1.0 with{' '}                                                                                       
              <a
                href="https://www.instagram.com/uni.pum/"                                                                      
                target="_blank"                                                                                                
                rel="noopener noreferrer"                                                                                      
                className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"                                     
              >                                                                                                                
                @uni.pum                                                                                                       
              </a>  
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
