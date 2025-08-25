import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart'

export interface PieChartProps {
  data: {
    id: number
    value: number
    label: string
  }[]
}

export const exampleData: PieChartProps = {
  data: [
    { id: 0, value: 10, label: '' },
    { id: 1, value: 15, label: '' },
    { id: 2, value: 20, label: '' },
  ],
}

const PieChartComponent: React.FC<PieChartProps> = ({ data }) => {
  console.log('PieChart data:', data)
  
  // Ensure data is valid and has minimum requirements
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gruvbox-light-fg dark:text-gruvbox-dark-fg">
        No data available for pie chart
      </div>
    )
  }

  // Ensure all data items have required properties and valid values
  const validData = data.filter(item => 
    item && 
    typeof item.id === 'number' && 
    typeof item.value === 'number' && 
    item.value > 0 &&
    typeof item.label === 'string' && 
    item.label.trim() !== ''
  )

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gruvbox-light-fg dark:text-gruvbox-dark-fg">
        Invalid data format for pie chart
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center">
    <style jsx global>{`
      .css-1u0lry5-MuiChartsLegend-root {
        transform: translateX(100px);
      }

      /* Light mode - dark text */
      .css-1u0lry5-MuiChartsLegend-root text {
        fill: #3c3836 !important;
      }

      /* Dark mode - light text */
      .dark .css-1u0lry5-MuiChartsLegend-root text {
        fill: #ebdbb2 !important;
      }
    `}</style>
      <PieChart
        series={[
          {
            data: validData,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
          },
        ]}
        width={500}
        height={300}
        margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
      />
    </div>
  )
}

export default PieChartComponent
