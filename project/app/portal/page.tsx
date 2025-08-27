
import React from 'react'
import { Button } from '@mui/material'
const page = () => {
  return (
    <div className='flex flex-col'>
        <div>
            <h1>Portal Page</h1>
            <Button type="link" href="/tutor">Tutor Dashboard</Button>
            <Button type="link" href="/assistent">Teaching assistant Dashboard</Button>
            <Button type="link" href="/coordinator">Coordinator Dashboard</Button>
            <Button type="link" href="/admin">System Admin Dashboard</Button>
        </div>
    </div>
  )
}

export default page
