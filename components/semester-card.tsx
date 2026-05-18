import React from 'react'

const SemesterCard = () => {
    return (
        <div className="border-2 rounded-2xl p-4">
            <header className="flex justify-between">
                <div>
                    <h2 className="font-bold text-xl">1. Semester
                    </h2>
                    <p className="opacity-70 text-sm">2 Module</p>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-xl text-oxblood">20</h2>
                    <p>ECTS</p>
                </div>
            </header>

        </div>
    )
}
export default SemesterCard
