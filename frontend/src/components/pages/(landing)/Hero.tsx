"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield, FiClock, FiSettings, FiSend, FiX } from "react-icons/fi";

export function Hero() {
  const [showModal, setShowModal] = useState(false);
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 py-16">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src="/Assets/Animation/silk-bg.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
        <div className="mb-16">
          <Image
            src="/Assets/Images/Logo/sommemo-logo.png"
            alt="StelMemo"
            width={100}
            height={100}
            priority
          />
        </div>

        <h1 className="mb-5 text-center text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] sm:text-4xl md:text-5xl">
          Your crypto inheritance.{/* eslint-disable-next-line react/no-unescaped-entities */}{" "}
          Fully automated. Trustless.
        </h1>

        <p className="mb-12 max-w-2xl text-center text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] sm:text-base">
          StelMemo is a decentralized will protocol on Stellar. Set a beneficiary, deposit your
          assets, and define an inactivity period. If you ever go silent, the blockchain itself
          executes the transfer — no intermediaries, no keepers, no trusted third parties.
        </p>

        <div className="mb-24 flex items-center gap-3">
          <Link
            href="/main"
            className="cursor-pointer rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand/30 transition-all hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/40"
          >
            Launch App
          </Link>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="group cursor-pointer rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
          >
            <span className="flex items-center gap-1.5">
              Learn More
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-white/60">Built on Stellar</p>
          <div className="opacity-60 transition-opacity hover:opacity-100">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M6 12h12" />
            </svg>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-white/50">
            Automate transfer of your Stellar assets to trusted beneficiaries
          </p>
          <p className="mt-2 text-xs text-white/40">
            © 2026 StelMemo. All rights reserved.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>

              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  How StelMemo Works
                </h2>
                <p className="mt-2 text-gray-600">
                  Your digital legacy, secured on the Stellar blockchain
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10">
                    <FiShield className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      1. Create Your Will
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Connect your wallet and register a will on-chain. Designate a beneficiary
                      wallet address and choose your inactivity period (e.g., 30, 90, or 365 days).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10">
                    <FiClock className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      2. Deposit Assets
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Deposit XLM (and soon ERC-20 tokens & NFTs) into your vault. These assets
                      are held securely by the smart contract until inheritance triggers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10">
                    <FiSettings className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      3. Automatic Check-In Monitoring
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      A time-based subscription is created on-chain. You simply check in before
                      the deadline to confirm you're active — each check-in resets the timer.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10">
                    <FiSend className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      4. Trustless Inheritance
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      If the deadline passes without a check-in, Stellar validators automatically
                      execute the transfer. All assets move to your beneficiary — no keepers,
                      no oracles, no intermediaries required.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-gray-50 p-4">
                <p className="text-center text-sm text-gray-600">
                  Powered by <span className="font-semibold text-brand">Stellar on-chain automation</span>
                  {"; "}fully trustless and decentralized
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
