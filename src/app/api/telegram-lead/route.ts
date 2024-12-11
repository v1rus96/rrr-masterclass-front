import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userid, username, languagecode, firstname, lastname, phonenumber } = body;

    // Validate required fields
    if (!userid || !firstname || !lastname || !phonenumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('userid', userid)
      .single();

    let result;
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          firstname,
          lastname,
          phonenumber,
          username,
          languagecode,
          updatedat: new Date().toISOString()
        })
        .eq('userid', userid)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          userid: userid,
          firstname,
          lastname,
          phonenumber,
          username,
          languagecode,
          status: 'lead',
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(
      { message: 'User information saved successfully', user: result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving user information:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save user information' },
      { status: 500 }
    );
  }
}
