import React, { useEffect, useReducer } from 'react'
import Header from './components/Header'
import Main from './components/Main'
import Loader from './components/Loader'
import Error from './components/Loader'
import StartScreen from './components/StartScreen'
import Questions from './components/Questions'
import NextButton from './components/NextButton'
import Progress from './components/Progress'
import FinishScreen from './components/FinishScreen'
const initialState = {
    questions: [],
    // 'loading', 'error', 'ready', 'active', 'finished'
    status: "loading",
    index: 0,
    answer: null,
    points: 0,
    highscore: 0
}

function reducer(state, action) {
    switch (action.type) {
        case 'dataRecived':
            return {
                ...state,
                questions: action.payload,
                status: 'ready'
            }
        case 'dataFailed':
            return {
                ...state,
                status: 'Error',
            }
        case 'start':
            return {
                ...state,
                status: 'active'
            }

        case 'newAnswer':
            const question = state.questions.at(state.index);
            return {
                ...state,
                answer: action.payload,
                points: action.payload === question.correctOption ? state.points + question.points : state.points
            }

        case 'nextQuestion':
            return {
                ...state, index: state.index + 1, answer: null
            }
        case 'finish':
            return {
                ...state, status: "finished", highscore: state.points > state.highscore ? state.points : state.highscore
            }

        case 'restart':
            return {
                ...initialState, questions: state.questions, status: "ready", highscore: state.highscore
            }
        default:
            break;
    }
}

const App = () => {
    const [{ status, questions, index, answer, points, highscore }, dispatch] = useReducer(reducer, initialState)
    const numQuestions = questions.length;
    const maxPossiblePoints = questions.reduce((prev, cur) => prev + cur.points, 0)
    useEffect(() => {
        fetch("http://localhost:8000/questions")
            .then((res) => res.json())
            .then(data => dispatch({ type: "dataRecived", payload: data }))
            .catch(() => dispatch({ type: "dataFailed" }))
    }, [])
    return (
        <div className='app'>
            {/* <DateCounter /> */}
            <Header />

            <Main>
                {status === 'loading' && <Loader />}
                {status === 'error' && <Error />}
                {status === 'ready' && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}
                {status === 'active' && <>
                    <Progress answer={answer} index={index} numOfQuestions={numQuestions} points={points} maxPossiblePoints={maxPossiblePoints} />
                    <Questions question={questions[index]} answer={answer} dispatch={dispatch} />
                    <NextButton dispatch={dispatch} index={index} numOfQuestions={numQuestions} answer={answer} />
                </>
                }
                {status === "finished" && <FinishScreen maxPossiblePoints={maxPossiblePoints} points={points} highscore={highscore} dispatch={dispatch} />}
            </Main>
        </div>
    )
}

export default App