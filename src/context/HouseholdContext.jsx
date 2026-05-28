import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  getMyHousehold,
  createHousehold,
  joinHousehold,
  getProfile
} from '../db/repositories'

const HouseholdContext = createContext(null)

export function HouseholdProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [household, setHousehold] = useState(null)
  const [baby, setBaby] = useState(null)
  const [members, setMembers] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadHouseholdData = useCallback(async (userId) => {
    if (!userId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      // 1. Get household details from repository
      const data = await getMyHousehold(userId)
      if (data) {
        setHousehold(data.household)
        setBaby(data.baby)
        setMembers(data.members || [])
      } else {
        setHousehold(null)
        setBaby(null)
        setMembers([])
      }

      // 2. Resolve user's profile
      const profile = await getProfile(userId)
      if (profile) {
        setMyProfile(profile)
      } else {
        setMyProfile(null)
      }
    } catch (error) {
      console.error('Failed to resolve active family household details:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setHousehold(null)
      setBaby(null)
      setMembers([])
      setMyProfile(null)
      setIsLoading(false)
      return
    }

    loadHouseholdData(user.id)
  }, [isAuthenticated, user, loadHouseholdData])

  const createNewHousehold = async (babyName, babyDob) => {
    if (!user) throw new Error('Cannot create household: No authenticated user found.')
    
    const result = await createHousehold(babyName, babyDob, user.id, user.email)
    if (result) {
      setHousehold(result.household)
      setBaby(result.baby)
      setMembers([result.member])
      
      // Refresh to load completed profile contexts and co-members
      await loadHouseholdData(user.id)
    }
    return result
  }

  const joinExistingHousehold = async (householdId) => {
    if (!user) throw new Error('Cannot join household: No authenticated user found.')

    const result = await joinHousehold(householdId, user.id, user.email)
    
    // Re-fetch all household tables to cache locally
    await loadHouseholdData(user.id)
    return result
  }

  const refreshHousehold = async () => {
    if (user) {
      await loadHouseholdData(user.id)
    }
  }

  const hasHousehold = !!household

  const contextValue = {
    household,
    baby,
    members,
    myProfile,
    isLoading,
    hasHousehold,
    createNewHousehold,
    joinExistingHousehold,
    refreshHousehold
  }

  return (
    <HouseholdContext.Provider value={contextValue}>
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold() {
  const context = useContext(HouseholdContext)
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider')
  }
  return context
}
