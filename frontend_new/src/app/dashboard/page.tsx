'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, ArrowUpDown, Youtube } from 'lucide-react'
import { format, parseISO } from 'date-fns'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Project {
  project_id: number
  idea_title: string
  idea_desc: string
  date_created: string
  last_modified: string
}

// Hardcoded data as if received from API
// let initialData: Project[] = [
//   {
//     project_id: 1,
//     idea_title: "AI-Powered Content Generator",
//     idea_desc: "A tool that uses AI to generate high-quality content for various platforms.",
//     date_created: "2023-05-15",
//     last_modified: "2023-06-20"
//   },
//   {
//     project_id: 2,
//     idea_title: "Blockchain-based Supply Chain",
//     idea_desc: "A system to track products through the supply chain using blockchain technology.",
//     date_created: "2023-06-01",
//     last_modified: "2023-07-10"
//   },
//   {
//     project_id: 3,
//     idea_title: "Virtual Reality Fitness App",
//     idea_desc: "An immersive fitness application that combines VR technology with workout routines.",
//     date_created: "2023-06-15",
//     last_modified: "2023-08-05"
//   },
//   {
//     project_id: 4,
//     idea_title: "Smart Home Energy Management",
//     idea_desc: "A system to optimize energy usage in homes using IoT devices and AI algorithms.",
//     date_created: "2023-07-01",
//     last_modified: "2023-08-20"
//   },
//   {
//     project_id: 5,
//     idea_title: "Decentralized Social Media",
//     idea_desc: "A social media platform built on decentralized technologies for enhanced privacy.",
//     date_created: "2023-07-20",
//     last_modified: "2023-09-01"
//   },
//   {
//     project_id: 6,
//     idea_title: "AR-Enhanced Education Tool",
//     idea_desc: "An educational platform that uses augmented reality to enhance learning experiences.",
//     date_created: "2023-08-05",
//     last_modified: "2023-09-15"
//   },
//   {
//     project_id: 7,
//     idea_title: "Quantum Computing Simulator",
//     idea_desc: "A software tool to simulate quantum computing processes for research and education.",
//     date_created: "2023-08-20",
//     last_modified: "2023-10-01"
//   }
//   ]
const initialData: Project[] = [
  {
    project_id: 1,
    idea_title: "Loading..",
    idea_desc: "Loading..",
    date_created: "2023-06-01",
    last_modified: "2023-06-01"
  },
  {
    project_id: 1,
    idea_title: "Loading..",
    idea_desc: "Loading..",
    date_created: "2023-06-01",
    last_modified: "2023-06-01"
  },
  {
    project_id: 1,
    idea_title: "Loading..",
    idea_desc: "Loading..",
    date_created: "2023-06-01",
    last_modified: "2023-06-01"
  },
  {
    project_id: 1,
    idea_title: "Loading..",
    idea_desc: "Loading..",
    date_created: "2023-06-01",
    last_modified: "2023-06-01"
  },
  {
    project_id: 1,
    idea_title: "Loading..",
    idea_desc: "Loading..",
    date_created: "2023-06-01",
    last_modified: "2023-06-01"
  },
  ]

export default function DashboardPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<Project[]>(initialData)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user_id = "1SpHj23Df5";
        const response = await fetch("http://localhost:8080/apis/retrieve_projects", {
          method: 'POST',  
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user_id 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json();
        setData(data["projects"]);
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])


  const deleteProject = async (id: number) => {
    // In a real application, you would call your API here
    // For now, we'll just simulate the API call
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

    // Remove the project from the data
    setData(currentData => currentData.filter(project => project.project_id !== id))
  }

  let i = 1;
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "project_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-800 hover:text-gray-100"
          >
            Sr. No
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        )
      },
      // cell: ({ row }) => <div className="text-center">{row.getValue("project_id")}</div>,
      cell: ({ row }) => <div className="text-center">{i++}</div>,
    },
    {
      accessorKey: "idea_title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-800 hover:text-gray-100"
          >
            Idea Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const title = row.getValue("idea_title") as string
        return <div>{title.length > 30 ? `${title.substring(0, 30)}...` : title}</div>
      },
    },
    {
      accessorKey: "date_created",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-800 hover:text-gray-100"
          >
            Date Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => format(parseISO(row.getValue("date_created")), 'PP'),
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = parseISO(rowA.getValue(columnId))
        const dateB = parseISO(rowB.getValue(columnId))
        return dateA.getTime() - dateB.getTime()
      },
    },
    {
      accessorKey: "last_modified",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-800 hover:text-gray-100"
          >
            Date Modified
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => format(parseISO(row.getValue("last_modified")), 'PP'),
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = parseISO(rowA.getValue(columnId))
        const dateB = parseISO(rowB.getValue(columnId))
        return dateA.getTime() - dateB.getTime()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original
        // console.log(row.original.project_id)

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-800">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 text-gray-100 border-gray-700">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.project_id.toString())} className="hover:bg-gray-800 hover:text-gray-100">
                Copy project ID
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation(); 
                  router.push(`/project_idea/${project.project_id}`);
                }}
                className="hover:bg-gray-800 hover:text-gray-100"
              >
                Update Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteProject(project.project_id)} className="hover:bg-gray-800 hover:text-gray-100">
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  const channelName = "Your Channel Name"

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-950 text-gray-100 p-4">
      <div className="w-full max-w-4xl">
      <div className="flex flex-col items-center mb-8 pt-14">
          <div className="relative w-16 h-16 mb-4">
            {/* <Image
              src="/placeholder.svg"
              alt="Channel Icon"
              layout="fill"
              className="rounded-full"
            />
            <Youtube className="absolute inset-0 m-auto text-green-500" size={32} /> */}
            <ArrowUpDown/>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <h1 className="text-xl font-bold text-center">
                  {channelName.length > 50 ? `${channelName.substring(0, 50)}...` : channelName}
                </h1>
              </TooltipTrigger>
              <TooltipContent>
                <p>{channelName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="rounded-md border border-gray-800">
          <div className="flex items-center py-2 px-4">
            <Input
              placeholder="Filter ideas..."
              value={(table.getColumn("idea_title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("idea_title")?.setFilterValue(event.target.value)
              }
              className="max-w-48 max-h-12 bg-gray-900 text-gray-100 border-gray-800 focus:border-gray-600"
            />
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-gray-800">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-400">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TooltipProvider key={row.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TableRow
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-gray-900 cursor-pointer transition-colors border-b border-gray-800 relative"
                          onClick={() => router.push(`/project/${row.original.project_id}`)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TooltipTrigger>
                      <TooltipContent 
                        className="w-64 bg-gray-900 text-gray-100 border border-gray-700 p-3 rounded-lg shadow-lg"
                        sideOffset={5}
                      >
                        <p className="font-bold mb-2 text-indigo-300">{row.original.idea_title}</p>
                        <p className="text-sm text-gray-300">{row.original.idea_desc}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4 px-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}