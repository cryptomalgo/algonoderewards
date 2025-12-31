// Re-exports for backwards compatibility
// Moved to hooks/queries folder for better organization
export {
  useNFDResolve,
  useNFDReverse,
  useNFDReverseMultiple,
  getExpirationStatus,
  type NFDExpirationStatus,
  type NFDExpirationInfo,
} from "@/hooks/queries/useNFD";
