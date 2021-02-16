import React,{ useEffect,useState}from 'react';
import { Link } from "react-router-dom";
import { AiOutlineUp } from 'react-icons/ai';
import { BsBookmark } from 'react-icons/bs';
import { BsFillBookmarkFill } from 'react-icons/bs';

const NextLaunches = () => {

    //fetching failed
    const[error,setError] = useState(undefined)

    //table info
    const[dataTable,setDataTable] = useState([])
    const[savedDataRows,setSavedDataRows] = useState([])

    //favorites
    const[buttonText,setButtonText] = useState("Saved Items")
    const[showFavorites,setShowFavorites] = useState(false)

    //save row
    const saveRow = (id,mission,date,launchpad,saved) => {
        if(!saved){
            const newSavedRow = {                       
                id: id,
                mission: mission,
                date: date,
                launchpad: launchpad,
            }
            localStorage.setItem(`${id}`, JSON.stringify(newSavedRow))
        }else{
            localStorage.removeItem(`${id}`)
        }
        if((localStorage.length === 0 && saved) && showFavorites){
            setShowFavorites(false)
            setButtonText('Saved Items')
        }
        //update table
        const newDataTable = dataTable.map(data => {
            if(data.id === id){
                const newData = {...data,saved:!data.saved}
                return newData
            }
            return data
        })
        setDataTable(newDataTable)
    }

    const handleClickFavorites = () => {
        setShowFavorites(!showFavorites)
        setButtonText(showFavorites?"Saved Items":"Return")
        if(!showFavorites){
            let savedDataTable = []
            Object.keys(localStorage).forEach(key => {
                const row = JSON.parse(localStorage.getItem(key))
                savedDataTable = savedDataTable.concat(row)
            })
            //map saved data to rows
            const savedRowsTable = savedDataTable.map(data => {
                return(
                    <tr key={data.id} >
                        <td className="mission">{data.mission}</td>
                        <td className="date">{new Date(data.date).toUTCString()}</td>
                        <td className="launchpad">{data.launchpad}</td>
                    </tr>  
                )
            })
            setSavedDataRows(savedRowsTable)
        }
    }

    //fetch data
    useEffect(() => {
        const fetchData = async () => {
            try{
                const urlNextLaunches = process.env.REACT_APP_API_URL + "/launches/upcoming"
                const launches = await fetch(urlNextLaunches).then(res => res.json())
                const launchpads = await Promise.all(
                    launches.map(
                        launch => fetch(process.env.REACT_APP_API_URL + "/launchpads/" + launch.launchpad).then(res => res.json())
                    )
                )
                const dataTable = launches.map((launch,index) => {
                    return(
                        {
                            id: launch.id,
                            mission: launch.name,
                            date: launch.date_utc,
                            launchpad: launchpads[index].name,
                            saved: localStorage.getItem(launch.id)?true:false
                        }
                    )
                })
                setDataTable(dataTable)
            }catch(e){
                setError(e.message)
            }
        }
        fetchData()
    },[])

    //map data to rows
    const rowsTable = dataTable.map(data => {
        return(
            <tr key={data.id} >
                <td className="mission">{data.mission}</td>
                <td className="date">{new Date(data.date).toUTCString()}</td>
                <td className="launchpad">{data.launchpad}</td>
                <td className="bookmark">
                    {data.saved?
                        <BsFillBookmarkFill color='red' size={20} style={{cursor:'pointer'}} onClick={() => saveRow(data.id,data.mission,new Date(data.date).toUTCString(),data.launchpad,data.saved)}/>:
                        <BsBookmark size={20} style={{cursor:'pointer'}} onClick={() => 
                            saveRow(data.id,data.mission,new Date(data.date).toUTCString(),data.launchpad,data.saved)}/>
                    }
                </td>
            </tr>  
        )
    })

    //Display error message if the fetching failed
    if(error){
        return(
            <div className='background-pink'>
                <div className='card-table'>
                    {error}
                </div>
            </div> 
        )
    }

    return(
        <div className='background-pink'>
            <h2 style={{textAlign:'center',color:'white'}}>Upcoming - Next Launches</h2>
            {localStorage.length>0?
                <div style={{textAlign:'center'}}>
                    <button onClick={() => handleClickFavorites()}>{buttonText}</button>
                </div>:
                null
            }
            <div className='card-table'>
                {
                    showFavorites?
                        <table>
                            <thead>
                                <tr>
                                    <th className="mission">Mission</th>
                                    <th className="date">Date(UTC)</th>
                                    <th className="launchpad">Launchpad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedDataRows}         
                            </tbody>
                        </table>:
                        <table>
                            <thead>
                                <tr>
                                    <th className="mission">Mission</th>
                                    <th className="date">Date(UTC)</th>
                                    <th className="launchpad">Launchpad</th>
                                    <td className="bookmark">Save</td>
                                </tr>
                            </thead>
                            <tbody>
                                {rowsTable}         
                            </tbody>
                        </table>
                }
            </div>
            <div style={{textAlign:'center'}}>
                <Link to="/"><AiOutlineUp color='white' size={35}/></Link>
            </div>
        </div>
    )
}

export default NextLaunches