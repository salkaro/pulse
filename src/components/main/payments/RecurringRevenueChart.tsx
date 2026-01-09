"use client"

import React, { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartPie } from 'lucide-react'
import { IConnection } from '@/models/connection'
import { colors } from '@/constants/colors'
import { ICharge } from '@/models/charge'
import { formatCurrency, formatYAxis } from '@/utils/formatters'

interface Props {
    chargesByConnection: Record<string, ICharge[]>
    connections: IConnection[]
}

interface ChartDataPoint {
    date: string;
    revenue: number;
    formattedDate: string;
    [entityName: string]: number | string;
}

const RecurringRevenueChart: React.FC<Props> = ({ chargesByConnection, connections }) => {

    const chartData = useMemo(() => {
        // Get all charges from all connections
        const allCharges = Object.entries(chargesByConnection).flatMap(([connectionId, charges]) =>
            charges.map(charge => ({ ...charge, connectionId }))
        )

        // Filter recurring charges (successful recurring payments)
        const recurringCharges = allCharges.filter(charge =>
            charge.type === 'recurring' &&
            charge.status === 'successful'
        )

        if (recurringCharges.length === 0) return []

        // Check if all charges are within a week
        const sortedCharges = [...recurringCharges].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        const firstDate = new Date(sortedCharges[0].createdAt)
        const lastDate = new Date(sortedCharges[sortedCharges.length - 1].createdAt)
        const daysDiff = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
        const isWithinWeek = daysDiff <= 7

        // Group by date or time depending on span
        const timeMap = new Map<string, { total: number; byConnection: Record<string, number> }>()

        recurringCharges.forEach(charge => {
            const date = new Date(charge.createdAt)
            let timeKey: string

            if (isWithinWeek) {
                // Group by hour for data within a week
                timeKey = date.toISOString().split(':')[0] + ':00:00.000Z'
            } else {
                // Group by day for data spanning more than a week
                timeKey = date.toISOString().split('T')[0]
            }

            const currentData = timeMap.get(timeKey) || { total: 0, byConnection: {} }

            currentData.total += charge.amount
            currentData.byConnection[charge.connectionId] = (currentData.byConnection[charge.connectionId] || 0) + charge.amount

            timeMap.set(timeKey, currentData)
        })

        // Sort times and create cumulative data
        const sortedTimes = Array.from(timeMap.keys()).sort()
        const connectionIds = Object.keys(chargesByConnection)

        const data = sortedTimes.reduce((acc, timeKey) => {
            const previousData = acc.length > 0 ? acc[acc.length - 1] : null
            const timeData = timeMap.get(timeKey)!
            const date = new Date(timeKey)

            const dataPoint: ChartDataPoint = {
                date: timeKey,
                revenue: (previousData?.revenue || 0) + timeData.total,
                formattedDate: isWithinWeek
                    ? date.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })
                    : date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })
            }

            // Add cumulative revenue for each connection
            connectionIds.forEach(connectionId => {
                const connection = connections.find(c => c.id === connectionId)
                const entityName = connection?.entityName || `Connection ${connectionId.slice(0, 8)}`
                const timeAmount = timeData.byConnection[connectionId] || 0
                const previousValue = previousData?.[entityName]
                dataPoint[entityName] = (typeof previousValue === 'number' ? previousValue : 0) + timeAmount
            })

            acc.push(dataPoint)
            return acc
        }, [] as ChartDataPoint[])

        // If only 1 data point, add padding points to span full width
        if (data.length === 1) {
            const singlePoint = data[0]
            return [
                { ...singlePoint, formattedDate: '' }, // Start padding
                singlePoint, // Actual data point
                { ...singlePoint, formattedDate: '' }  // End padding
            ]
        }

        return data
    }, [chargesByConnection, connections])

    const formatCurrencyByFirstCharge = (value: number) => {
        // Get currency from first available charge
        const firstCharge = Object.values(chargesByConnection).flat()[0]
        return formatCurrency(value, firstCharge.currency)
    }

    // Generate colors for each entity
    const totalColor = "#f97342";

    const entityNames = useMemo(() => {
        const connectionIds = Object.keys(chargesByConnection)
        return connectionIds.map(connectionId => {
            const connection = connections.find(c => c.id === connectionId)
            return connection?.entityName || `Connection ${connectionId.slice(0, 8)}`
        })
    }, [chargesByConnection, connections])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <ChartPie className="w-4 h-4" />
                    Recurring Revenue
                </CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                        No recurring revenue data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="formattedDate"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={formatYAxis}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                                                <div className="text-xs text-muted-foreground mb-2">
                                                    {(payload[0].payload as ChartDataPoint).formattedDate}
                                                </div>
                                                {payload.map((entry, index: number) => (
                                                    <div key={index} className="flex items-center justify-between gap-4 text-sm">
                                                        <span className="flex items-center gap-2">
                                                            <span
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: entry.color }}
                                                            />
                                                            {entry.name}:
                                                        </span>
                                                        <span className="font-semibold">
                                                            {formatCurrencyByFirstCharge(typeof entry.value === 'number' ? entry.value : 0)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: '12px' }}
                                iconType="line"
                            />
                            {/* Render total revenue first */}
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Total"
                                stroke={totalColor}
                                strokeWidth={2}
                                fill="transparent"
                            />
                            {/* Render each entity's revenue */}
                            {entityNames.map((entityName, index) => (
                                <Area
                                    key={entityName}
                                    type="monotone"
                                    dataKey={entityName}
                                    name={entityName}
                                    stroke={colors[index % colors.length]}
                                    strokeWidth={1.5}
                                    fill="transparent"
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}

export default RecurringRevenueChart
