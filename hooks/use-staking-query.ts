import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import {
  getStakingPlan,
  getPlanRate,
  getUserStakingAmount,
  stakePOL,
  getActiveStakesCount,
  claimRewards,
  getRewardsData,
} from '@/lib/wagmi-config'

export function useStakingQuery(address: Address | undefined) {
  const queryClient = useQueryClient()

  // Query for staking plan
  const { data: stakingPlan } = useQuery({
    queryKey: ['stakingPlan', address],
    queryFn: () => getUserStakingAmount(address),
    enabled: !!address,
  })

  // Query for plan rate
  const { data: planRate } = useQuery({
    queryKey: ['planRate', stakingPlan],
    queryFn: () => getPlanRate(stakingPlan || 0),
    enabled: !!stakingPlan,
  })

  // Query for user staking amount
  const { data: stakingAmount } = useQuery({
    queryKey: ['stakingAmount', address],
    queryFn: () => getUserStakingAmount(address),
    enabled: !!address,
  })

  // Query for active stakes count
  const { data: activeStakesCount } = useQuery({
    queryKey: ['activeStakesCount', address],
    queryFn: () => getActiveStakesCount(address),
    enabled: !!address,
  })

  // Query for rewards data
  const { data: rewardsData } = useQuery({
    queryKey: ['rewardsData', address],
    queryFn: () => getRewardsData(address),
    enabled: !!address,
  })

  // Mutation for staking
  const stakeMutation = useMutation({
    mutationFn: (amount: number) => stakePOL(amount, address || "0x0000000000000000000000000000000000000000" as Address),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['stakingAmount'] })
      queryClient.invalidateQueries({ queryKey: ['activeStakesCount'] })
      queryClient.invalidateQueries({ queryKey: ['rewardsData'] })
    },
  })

  // Mutation for claiming rewards
  const claimRewardsMutation = useMutation({
    mutationFn: claimRewards,
    onSuccess: () => {
      // Invalidate rewards data
      queryClient.invalidateQueries({ queryKey: ['rewardsData'] })
    },
  })

  return {
    stakingPlan,
    planRate,
    stakingAmount,
    activeStakesCount,
    rewardsData,
    stake: stakeMutation.mutate,
    claimRewards: claimRewardsMutation.mutate,
    isStaking: stakeMutation.isPending,
    isClaiming: claimRewardsMutation.isPending,
  }
} 
