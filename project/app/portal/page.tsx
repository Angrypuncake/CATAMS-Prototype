
import React from 'react'
import { Button } from '@mui/material'
const page = () => {
  return (
    <div className='flex flex-col gap-2'>
        <h1>Portal Page</h1>
        <Button type="link" href="/dashboard/tutor" variant="outlined" sx={{borderColor: 'black', textTransform: "none", width:'300px'}}>Tutor Dashboard</Button>
        <Button type="link" href="/dashboard/assistent" variant="outlined" sx={{borderColor: 'black', textTransform: "none", width:'300px'}}>Teaching assistant Dashboard</Button>
        <Button type="link" href="/dashboard/coordinator" variant="outlined" sx={{borderColor: 'black', textTransform: "none", width:'300px'}}>Coordinator Dashboard</Button>
        <Button type="link" href="/dashboard/admin" variant="outlined" sx={{borderColor: 'black', textTransform: "none", width:'300px'}}>System Admin Dashboard</Button>
    </div>
  )
}

export default page
