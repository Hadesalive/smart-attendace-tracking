import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  // let response = NextResponse.next({
  //   request: {
  //     headers: request.headers,
  //   },
  // })

  // const supabase = createServerClient(
  //   process.env.SUPABASE_URL!,
  //   process.env.SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       get(name: string) {
  //         return request.cookies.get(name)?.value
  //       },
  //       set(name: string, value: string, options: CookieOptions) {
  //         // If the cookie is set, update the request's cookies.
  //         request.cookies.set({
  //           name,
  //           value,
  //           ...options,
  //         })
  //         response = NextResponse.next({
  //           request: {
  //             headers: request.headers,
  //           },
  //         })
  //         // Set the cookie on the response
  //         response.cookies.set({
  //           name,
  //           value,
  //           ...options,
  //         })
  //       },
  //       remove(name: string, options: CookieOptions) {
  //         // If the cookie is removed, update the request's cookies.
  //         request.cookies.set({
  //           name,
  //           value: '',
  //           ...options,
  //         })
  //         response = NextResponse.next({
  //           request: {
  //             headers: request.headers,
  //           },
  //         })
  //         // Set the cookie on the response to expire
  //         response.cookies.set({
  //           name,
  //           value: '',
  //           ...options,
  //         })
  //       },
  //     },
  //   }
  // )

  // return { supabase, response }

  return {
    supabase: null as any,
    response: NextResponse.next({
      request: {
        headers: request.headers,
      },
    }),
  }
}
