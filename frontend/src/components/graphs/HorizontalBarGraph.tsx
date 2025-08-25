import React from 'react'
import { BarChart } from '@mui/x-charts/BarChart'

export interface HorizontalBarGraphProps {
  data: {
    labels: string[]
    values: { data: number[]; label: string }[]
  }
}

// Example usage:
export const exampleData: HorizontalBarGraphProps = {
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [{ data: [21.5, 25.0, 47.5, 64.8, 105.5, 133.2], label: '' }],
  },
}

const HorizontalBarGraph: React.FC<HorizontalBarGraphProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: '300px', padding: '20px' }}>
      <BarChart
        yAxis={[{ scaleType: 'band', data: data.labels }]}
        series={data.values}
        layout='horizontal'
        height={300}
        margin={{ left: 120, right: 40, top: 40, bottom: 40 }}
        tooltip={{
          trigger: 'item',
        }}
        sx={{
          '& .MuiResponsiveChart-container': {
            width: '100% !important',
          }
        }}
      />
    </div>
  )
}

export default HorizontalBarGraph
