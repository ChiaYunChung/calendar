'use client'
import { useState } from "react"

export default function Test()
{
    const [totalScore,setTotalScore]=useState<number>(0)
    const [isShow,setShow]=useState<boolean>(false)
    return(
        <div>
            <span>TOTALSCORE: {totalScore}</span>
            <button className="w-[10%] h-[5vh] border-2 border-black hover:scale-110 hover:bg-blue-300" onClick={()=>setShow((prev)=>!prev)}>click me</button>
            <Score setTotalScore={setTotalScore} totalScore={totalScore}></Score>
            {isShow && <Score2></Score2>}
        </div>
    )

}





function Score({setTotalScore,totalScore}:{setTotalScore:React.Dispatch<number>,totalScore:number})
{
    const [score,setScore]=useState<number>(0)

    function OnClickHandler()
    {
        setTotalScore(totalScore+1)
        setScore(score+1)
    }

    return(
        <div>
            <span className=" font-black font-bold text-[30px]">{score}</span>
            <button className="w-[10%] h-[5vh] border-2 border-black hover:scale-110 hover:bg-blue-300" onClick={()=>OnClickHandler()}>click me</button>
        </div>
    )
}

function Score2()
{
    const [score,setScore]=useState<number>(0)
    return(
        <div>
            <span className=" font-black  text-[30px]">{score}</span>
            <button className="w-[10%] h-[5vh] border-2 border-black hover:scale-110 hover:bg-blue-300" onClick={()=>setScore(score+1)}>click me</button>
        </div>
    )
}