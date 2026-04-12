'use client'

import { useTransition } from 'react'
import { removeParticipant } from './actions'

export default function RemoveParticipantButton({ participantId, eventId }: { participantId: number; eventId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    if (!confirm('Xoá công thức này khỏi sự kiện?')) return
    startTransition(async () => {
      await removeParticipant(participantId, eventId)
    })
  }

  return (
    <button onClick={handleRemove} disabled={isPending}
      className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-lg text-xs font-medium transition">
      {isPending ? '...' : 'Xoá'}
    </button>
  )
}
