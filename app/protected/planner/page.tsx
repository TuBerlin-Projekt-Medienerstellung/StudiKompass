import React from 'react'
import SemesterCard from "@/components/semester-card";

const Page = () => {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="font-bold text-4xl">Studienplaner</h1>
                <p className="opacity-70">Plane dein Studium semesterweise</p>
            </div>
            <SemesterCard/>
        </section>
    )
}
export default Page
