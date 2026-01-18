import {nanoid} from "nanoid";
import {IndexedDB} from "./db";
import {QUIZZES_DB_VERSION, QUIZZES_ENTITY, QUIZZES_DB_NAME} from "../../constans";

export const dbPromise = IndexedDB.open(QUIZZES_DB_NAME, QUIZZES_DB_VERSION, (db) => {
    if (!db.objectStoreNames.contains(QUIZZES_ENTITY)) {
        db.createObjectStore(QUIZZES_ENTITY, { keyPath: 'id' });
    }
});

export async function addQuiz(quiz) {
    const db = await dbPromise;

    return db.put(QUIZZES_ENTITY, {id: nanoid(), ...quiz});
}

export async function getQuiz(id) {
    const db = await dbPromise;

    return db.get(QUIZZES_ENTITY, id);
}

export async function getAllQuizzes() {
    const db = await dbPromise;

    return db.getAll(QUIZZES_ENTITY);
}