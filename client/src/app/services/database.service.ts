import { Injectable, inject } from "@angular/core"
import { Firestore, collectionData } from "@angular/fire/firestore"
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, writeBatch } from "firebase/firestore"
import { Storage, ref, uploadBytesResumable, getDownloadURL } from "@angular/fire/storage"
import type { Item } from "../models/item"

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  public firestore: Firestore = inject(Firestore)
  public storage: Storage = inject(Storage)

  constructor() {}

  getCollection() {
    const CollectionRef = collection(this.firestore, "products") as any
    return collectionData<Item>(CollectionRef)
  }

  async getItem(id: string): Promise<Item> {
    const docRef = doc(this.firestore, "products", id) as any
    const docSnap = await getDoc(docRef)
    return docSnap.data() as Item
  }

  async getItemsbyIDs(ids: string[]): Promise<Item[]> {
    const items: Item[] = []
    for (const id of ids) {
      const docRef = doc(this.firestore, "products", id) as any
      const docSnap = await getDoc(docRef)
      items.push(docSnap.data() as Item)
    }
    return items
  }

  async addProduct(item: Item): Promise<string> {
    // add product to collection and return the ID of the added document
    const CollectionRef = collection(this.firestore, "products") as any
    let ID = ""
    await addDoc(CollectionRef, item).then((docRef) => {
      ID = docRef.id
    })
    return ID
  }

  async setProductData(item: Item, imageUrl?: string) {
    try {
      // Add product and get the ID
      const ID = await this.addProduct(item)

      // Set product data with the correct ID
      const itemData = { ...item }
      itemData.id = ID

      if (imageUrl) {
        itemData.imageUrl = imageUrl
      }

      const docRef = doc(this.firestore, "products", ID)
      await setDoc(docRef, itemData)

      return ID
    } catch (error) {
      console.error("Error setting product data:", error)
      throw error
    }
  }

  async uploadFile(file: any, ID: string) {
    if (!file) return

    const newName = this.chnageFileName(file.name, ID)
    const storageRef = ref(this.storage, newName)

    try {
      await uploadBytesResumable(storageRef, file)

      const downloadUrl = await getDownloadURL(storageRef)

      return downloadUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }

  chnageFileName(fileName: string, ID: string) {
    const format = fileName.split(".").pop()
    const newFileName = ID + "." + format
    return newFileName
  }

  async updateProduct(id: string, item: Item): Promise<void> {
    const docRef = doc(this.firestore, "products", id)
    await setDoc(docRef, item)
  }

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(this.firestore, "products", id)
    await deleteDoc(docRef)
  }

  async deleteMultipleProducts(ids: string[]): Promise<void> {
    const batch = writeBatch(this.firestore)
    ids.forEach((id) => {
      const docRef = doc(this.firestore, "products", id)
      batch.delete(docRef)
    })
    await batch.commit()
  }

  // Invoice methods
  getInvoices() {
    const CollectionRef = collection(this.firestore, "invoices") as any
    return collectionData<any>(CollectionRef)
  }

  async addInvoice(invoice: any): Promise<string> {
    const CollectionRef = collection(this.firestore, "invoices") as any
    let ID = ""
    await addDoc(CollectionRef, invoice).then((docRef) => {
      ID = docRef.id
    })
    return ID
  }

  async updateInvoice(id: string, invoice: any): Promise<void> {
    const docRef = doc(this.firestore, "invoices", id)
    await setDoc(docRef, invoice)
  }

  async deleteInvoice(id: string): Promise<void> {
    const docRef = doc(this.firestore, "invoices", id)
    await deleteDoc(docRef)
  }
}
