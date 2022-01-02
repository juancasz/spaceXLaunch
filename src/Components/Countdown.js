import React,{ useEffect,useState,useRef } from 'react';
import { Link } from "react-router-dom";
import { AiOutlineDown } from 'react-icons/ai';
import {
    FacebookShareButton,
    FacebookIcon,
    LinkedinShareButton,
    LinkedinIcon,
    TwitterShareButton,
    TwitterIcon,
  } from "react-share"

//convert ms to days,hours,minutes,seconds
const convertTime = (milliSeconds) => {
    let days = Math.floor(milliSeconds/(86400 * 1000));
    milliSeconds -= days*(86400*1000);
    let hours = Math.floor(milliSeconds/(60 * 60 * 1000 ));
    milliSeconds -= hours * (60 * 60 * 1000);
    let minutes = Math.floor(milliSeconds/(60 * 1000));
    milliSeconds -= minutes * (60 * 1000);
    let seconds = Math.floor(milliSeconds/(1000));
    return {
      days,hours,minutes,seconds
    }       
}

//custom hook to execute callback function periodically (period = delay)
const useInterval = (callback, delay) => {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
}

const Countdown = () => {
    //object to store days,hours,minutes,seconds before launch
    const[objectTime,setObjectTime] = useState(null)

    //name of the following mission
    const[mission,setMission] = useState("")

    //fetching failed
    const[error,setError] = useState(undefined)

    const fetchData = async () => {
        try{
            const urlUpcomingLaunch = process.env.REACT_APP_API_URL + "/launches/next"
            const result = await fetch(urlUpcomingLaunch).then(res => res.json())
            const mission = result?result.name:""
            let launchDate = result?new Date(result.date_local):new Date()
            const actualDate = new Date()
            let timems = launchDate.getTime()- actualDate.getTime()
            if (timems < 0 ){
                const urlNextLaunches = process.env.REACT_APP_API_URL + "/launches/upcoming"
                const launches = await fetch(urlNextLaunches).then(res => res.json())
                launches.every(launch => {
                    launchDate = new Date(launch.date_utc)
                    timems = launchDate.getTime()- actualDate.getTime()
                    if (timems>0){
                        setMission(launch.name)
                        return false
                    }
                    return true
                });
            }
            const objectTime = convertTime(timems)
            setObjectTime(objectTime)
            setMission(mission)
        }catch(e){
            setError(e.message)
        }
    }

    //Fetch data after loading for the first time or if the time before launching has finished
    useEffect(() => {
        const timeFinished = objectTime?((objectTime.seconds === 0 && objectTime.minutes === 0) && 
        (objectTime.hours === 0 && objectTime.days === 0)):false
        if(!objectTime || timeFinished){
            fetchData()
        }
    },[objectTime])

    useInterval(() => {
        if(objectTime){
            const newObjectTime = {...objectTime,
                seconds: objectTime.seconds === 0? 59: objectTime.seconds-1,
                minutes: objectTime.seconds === 0? 
                            objectTime.minutes === 0?
                                59:objectTime.minutes-1:
                            objectTime.minutes,
                hours: objectTime.minutes === 0 && objectTime.seconds === 0?
                            objectTime.hours === 0?
                                23:objectTime.hours-1:
                            objectTime.hours,
                days: (objectTime.hours === 0 && objectTime.minutes === 0) && objectTime.seconds === 0?
                            objectTime.days -1: objectTime.days
            }
            setObjectTime(newObjectTime)
        }
    }, 1000);

    //Display error message if the fetching failed
    if(error){
        return(
            <div className='background-blue'>
                <div className='card'>
                    {error}
                </div>
            </div> 
        )
    }

    return(
        <div className='background-blue'>
            <h2 style={{textAlign:'center',color:'white'}}>Upcoming: {mission}</h2>
            <div className='card'>
                {objectTime?objectTime.days:0}
                <div className='card-countdown-text'>
                    DAYS
                </div>
                {objectTime?objectTime.hours:0}
                <div className='card-countdown-text'>
                    HOURS
                </div>
                {objectTime?objectTime.minutes:0}
                <div className='card-countdown-text'>
                    MINUTES
                </div>
                {objectTime?objectTime.seconds:0}
                <div className='card-countdown-text'>
                    SECONDS
                </div>
            </div>
            <div style={{textAlign:'center'}}>
                <Link to="/nextLaunches"><AiOutlineDown color='white' size={35}/></Link>
            </div>
            <div style={{textAlign:'center'}}>
                <FacebookShareButton url={String(window.location)}>
                    <FacebookIcon/>
                </FacebookShareButton>
                <TwitterShareButton url={String(window.location)}>
                    <TwitterIcon/>
                </TwitterShareButton>
                <LinkedinShareButton url={String(window.location)}>
                    <LinkedinIcon/>
                </LinkedinShareButton>
            </div>
        </div>
    )
}

export default Countdown