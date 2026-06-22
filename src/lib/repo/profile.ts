// Profile (goals) mutations over the reactive store, with cloud sync.
import { data } from '../stores/data.svelte'
import * as db from '../offline/localdb'
import { recordMutation } from '../offline/sync.svelte'
import type { Profile } from '../types'

export function setGoalWeight(goal: number): void {
  const next: Profile = { ...data.profile, goalWeight: goal, updatedAt: Date.now() }
  data.profile = next
  void db.putProfile({ ...next })
  recordMutation('profile', 'put', 'me', { ...next })
}
