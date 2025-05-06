"use client"
import { useState, useRef, useEffect } from "react"
import { Copy, QrCode, User, CreditCard, TrendingUp, ChevronDown, ChevronUp, Link, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/context/wallet-context"
import { QRCodeSVG } from "qrcode.react"
import { useReadContract } from "wagmi"
import { POLKING_ADDRESS, contractConfig } from "@/utils/contract-utils"
import { formatEther } from "viem"
import POLKING_ABI from "@/app/contracts/POLKING.json"

// Interface for affiliate data from contract
interface DownlineInfo {
  user: string // address
  volume: bigint
  activeStakeCount: bigint
}

const AffiliateSection = () => {
  // Use wallet address, isConnected is still useful but not for conditional rendering of the whole section
  const { address, isConnected } = useWallet()
  const [copySuccess, setCopySuccess] = useState(false)
  const [showQR, setShowQR] = useState(false) // This state might become less relevant with the modal
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({})
  const [isListExpanded, setIsListExpanded] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  // referrerAddress state is not used in the provided code, can be removed if not needed elsewhere
  // const [referrerAddress, setReferrerAddress] = useState<string | null>(null)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  // Get downline batch info from contract
  const { data: downlineData } = useReadContract({
    ...contractConfig,
    functionName: 'getDownlineBatchInfo',
    args: [address || "0x0000000000000000000000000000000000000000", 10] as const,
  })

  // Format number with spaces instead of commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  // Generate referral link - this will be an empty string if address is null/undefined
  const referralLink = address ? `${window.location.origin}?ref=${address}` : ""

  const handleCopy = () => {
    // Only attempt to copy if a referralLink exists (wallet is connected)
    if (referralLink) {
      // Use the Clipboard API if available
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(referralLink)
          .then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          })
          .catch(err => console.error('Failed to copy: ', err));
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = referralLink;
        textArea.style.position = "fixed";  // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
      }
    }
  }

  // Removed handleQRCode as it's replaced by the modal state setIsQRModalOpen

  // Toggle card expansion
  const toggleCard = (index: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Scroll to expanded list when opened
  useEffect(() => {
    if (isListExpanded && listRef.current) {
      // Use requestAnimationFrame for potentially smoother scroll after rendering
      requestAnimationFrame(() => {
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      });
    }
  }, [isListExpanded])

  // Close QR modal if wallet disconnects (optional but good practice)
  useEffect(() => {
    if (!address && isQRModalOpen) {
      setIsQRModalOpen(false);
    }
  }, [address, isQRModalOpen]);


  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-br from-[#0a0118] to-[#0e0424] text-white px-4 sm:px-6 md:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Blurred shapes */}
        <div className="absolute top-[30%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-[#a58af8]/10 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[#facc15]/10 blur-[80px]" />

        {/* Animated elements */}
        <motion.div
          animate={{
            x: ["-10%", "10%"],
            y: ["-5%", "5%"],
          }}
          transition={{
            x: { duration: 25, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            y: { duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
          }}
          className="absolute top-[40%] left-[20%] w-[25vw] h-[25vw] rounded-full bg-[#a58af8]/5 blur-[100px]"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 relative inline-block">
            <span className="text-gradient-gold">Affiliate Rewards</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Invite your network and earn a royal stream of POL tokens from your affiliates.
          </p>
        </motion.div>

        {/* Referral Link Card with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)] mb-6"
        >
          {/* Removed the !isConnected conditional rendering here */}
          <p className="text-sm text-white/80 mb-3 font-medium">Your Referral Link</p>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a58af8]">
                <Link size={16} />
              </div>
              <input
                readOnly // Always readOnly
                // Display referralLink if address exists, otherwise show a message
                value={address ? referralLink : "Connect wallet to generate your link"}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0f0c1a]/70 border border-[#a58af8]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#a58af8]/50 transition-all
                          ${address ? 'text-white' : 'text-white/60 italic'}`} // Add styling for unconnected state
              />
            </div>

            <div className="flex gap-3 sm:w-auto">
              <button
                onClick={handleCopy}
                disabled={!address} // Disable if wallet is not connected
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs bg-[#0f0c1a]/70 rounded-xl hover:bg-[#facc15]/10 hover:border-[#facc15]/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all duration-300 relative group
                          ${address ? 'text-[#facc15] border border-[#facc15]/30' : 'text-white/50 border border-[#a58af8]/20 cursor-not-allowed'}`} // Styling for disabled state
              >
                <Copy size={14} />
                <span>{copySuccess ? "Copied!" : "Copy"}</span>
                {/* Only show hover effect when enabled */}
                {address && <span className="absolute inset-0 rounded-xl bg-[#facc15]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>}
              </button>

              <button
                onClick={() => address && setIsQRModalOpen(true)} // Only open modal if wallet is connected
                disabled={!address} // Disable if wallet is not connected
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs bg-[#0f0c1a]/70 rounded-xl hover:bg-[#a58af8]/10 hover:border-[#a58af8]/50 hover:shadow-[0_0_15px_rgba(165,138,248,0.3)] transition-all duration-300 relative group
                          ${address ? 'text-[#a58af8] border border-[#a58af8]/30' : 'text-white/50 border border-[#a58af8]/20 cursor-not-allowed'}`} // Styling for disabled state
              >
                <QrCode size={14} />
                <span>QR Code</span>
                 {/* Only show hover effect when enabled */}
                {address && <span className="absolute inset-0 rounded-xl bg-[#a58af8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Affiliate List Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)]"
        >
          <div
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="flex items-center justify-between p-5 sm:p-6 cursor-pointer group transition-all duration-300 hover:bg-[#a58af8]/5 rounded-t-2xl"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User size={18} className="text-[#a58af8]" />
              Your Affiliate List
              {downlineData && `(${(downlineData as DownlineInfo[]).length})`}
            </h3>
            <div className="w-6 h-6 rounded-full bg-[#0f0c1a]/70 border border-[#a58af8]/30 flex items-center justify-center transition-transform duration-300 group-hover:border-[#a58af8]/60">
              {isListExpanded ? (
                <ChevronUp size={14} className="text-[#a58af8]" />
              ) : (
                <ChevronDown size={14} className="text-[#a58af8]" />
              )}
            </div>
          </div>

          <AnimatePresence>
            {isListExpanded && (
              <motion.div
                ref={listRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-5 sm:p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {!address && <p className="col-span-full text-center text-white/60 text-sm">Connect your wallet to see your actual affiliate list.</p>}
                  {address && (!downlineData || (downlineData as DownlineInfo[]).length === 0) && (
                    <p className="col-span-full text-center text-white/60 text-sm">No affiliates found yet.</p>
                  )}

                  {address && downlineData && (downlineData as DownlineInfo[]).map((affiliate, index) => (
                    <div
                      key={affiliate.user}
                      className="rounded-xl bg-[#0f0c1a]/70 border border-[#a58af8]/30 hover:border-[#a58af8]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(165,138,248,0.2)] overflow-hidden"
                    >
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#a58af8]/5 transition-colors duration-200"
                        onClick={() => toggleCard(index)}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-6 h-6 rounded-full bg-[#0f0c1a] border border-[#a58af8]/40 flex items-center justify-center flex-shrink-0">
                            <User size={12} className="text-[#a58af8]" />
                          </div>
                          <p className="text-white/90 text-sm font-medium truncate">{affiliate.user}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center flex-shrink-0">
                          {expandedCards[index] ? (
                            <ChevronUp size={12} className="text-[#a58af8]" />
                          ) : (
                            <ChevronDown size={12} className="text-[#a58af8]" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedCards[index] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2 p-3 pt-0 border-t border-[#a58af8]/10">
                              <div className="bg-[#0f0c1a]/50 rounded-lg p-2 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <CreditCard className="text-[#a58af8] w-3 h-3" />
                                  <p className="text-white/70 text-xs">Active Stakes</p>
                                </div>
                                <p className="text-xs font-bold text-white">
                                  {Number(affiliate.activeStakeCount)}
                                </p>
                              </div>

                              <div className="bg-[#0f0c1a]/50 rounded-lg p-2 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <TrendingUp className="text-[#a58af8] w-3 h-3" />
                                  <p className="text-white/70 text-xs">Total Volume</p>
                                </div>
                                <p className="text-xs font-bold text-[#facc15]">
                                  {formatEther(affiliate.volume)} POL
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Custom QR Code Modal */}
      <AnimatePresence>
        {/* Only render modal if it's open AND address exists */}
        {isQRModalOpen && address && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-black/90 via-[#0f0c1a]/90 to-[#0b0514]/90 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)] p-6"
            >
              {/* Close button */}
              <button
                onClick={() => setIsQRModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0f0c1a]/70 border border-[#a58af8]/30 flex items-center justify-center hover:bg-[#a58af8]/10 transition-colors"
              >
                <X size={16} className="text-[#a58af8]" />
              </button>

              {/* Modal content */}
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-white">Your Referral Link</h3>
                 {/* Render QR code only if referralLink is available */}
                 {referralLink ? (
                   <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                     <QRCodeSVG
                       value={referralLink}
                       size={200}
                       level="H"
                       includeMargin={false}
                       className="rounded-lg"
                     />
                   </div>
                 ) : (
                    // Show a message if no referral link (shouldn't happen if modal only opens when address exists)
                    <p className="text-sm text-white/70 mb-4">Connect wallet to generate QR Code.</p>
                 )}

                <p className="text-sm text-white/70 mb-4 break-all">
                   {/* Display referralLink if available, otherwise a message */}
                  {address ? referralLink : "Connect wallet to see the link."}
                </p>
                <button
                  onClick={handleCopy}
                   disabled={!address} // Disable button in modal too if no address
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-[#0f0c1a]/70 rounded-xl hover:bg-[#facc15]/10 hover:border-[#facc15]/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all duration-300
                            ${address ? 'text-[#facc15] border border-[#facc15]/30' : 'text-white/50 border border-[#a58af8]/20 cursor-not-allowed'}`} // Styling for disabled state
                >
                  <Copy size={16} />
                  <span>{copySuccess ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default AffiliateSection
