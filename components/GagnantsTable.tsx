'use client'

import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function GagnantsTable() {
    const [gagnants, setGagnants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    useEffect(() => {
        const fetchGagnants = async () => {
            try {
                const response = await fetch('https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/get-gagnants')
                const data = await response.json()
                setGagnants(data)
            } catch (error) {
                console.error('Erreur:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchGagnants()
    }, [])

    const totalPages = Math.ceil(gagnants.length / itemsPerPage)
    const paginatedGagnants = gagnants.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const exportToCSV = () => {
        const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Lot gagné', 'Type de lot', 'Date attribution', 'Statut validation']
        const csvRows = gagnants.map(row => [
            `"${row.nom}"`,
            `"${row.prenom}"`,
            `"${row.email}"`,
            `"${row.telephone}"`,
            `"${row.lot_titre}"`,
            `"${row.type_lot_nom}"`,
            `"${row.date_attribution}"`,
            `"${row.statut_validation}"`
        ].join(','))

        const csv = [headers.join(','), ...csvRows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'gagnants.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return <div>Chargement...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Button onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter en CSV
                </Button>
                <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage">Lignes par page :</label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={e => {
                            setItemsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                        }}
                        className="border rounded px-2 py-1"
                    >
                        {[5, 10, 20, 50, 100].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table className="text-black">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Prénom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Lot gagné</TableHead>
                            <TableHead>Type de lot</TableHead>
                            <TableHead>Date attribution</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedGagnants.map((gagnant, index) => (
                            <TableRow key={index + (currentPage - 1) * itemsPerPage}>
                                <TableCell>{gagnant.nom}</TableCell>
                                <TableCell>{gagnant.prenom}</TableCell>
                                <TableCell>{gagnant.email}</TableCell>
                                <TableCell>{gagnant.telephone}</TableCell>
                                <TableCell>{gagnant.lot_titre}</TableCell>
                                <TableCell>{gagnant.type_lot_nom}</TableCell>
                                <TableCell>
                                    {new Date(gagnant.date_attribution).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="text-black hover:bg-transparent hover:text-black"
                >
                    Précédent
                </Button>
                <span className="text-black">
                    Page {currentPage} sur {totalPages}
                </span>
                <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="text-black hover:bg-transparent hover:text-black"
                >
                    Suivant
                </Button>
            </div>
        </div>
    )
}